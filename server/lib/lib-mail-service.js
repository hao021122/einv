const nodemailer = require('nodemailer');
const { google } = require('googleapis');
const path = require('path');
const currentWorkingDirectory = process.cwd();

const { pgSql } = require('./lib-pgsql');
const notif = path.join(currentWorkingDirectory, './app/scheduler/notif.json');

const OAuth2 = google.auth.OAuth2;

/**
 * Address object for handling email addresses.
 */
function msgAddrObject(emailAddr) {
    this.name = null;
    this.email = null;

    this.toString = function () {
        return this.name ? `${this.name} <${this.email}>` : this.email;
    };

    if (typeof emailAddr === 'string') {
        let pos = emailAddr.indexOf('<');
        this.name = pos > 0 ? emailAddr.substring(0, pos).trim() : null;
        this.email = pos > 0 ? emailAddr.substring(pos + 1, emailAddr.indexOf('>')).trim() : emailAddr;
    };
};

/**
 * Message object for holding email data.
 */
function msgObject() {
    this.from = null;
    this.to = null;
    this.cc = null;
    this.bcc = null;
    this.subject = null;
    this.bodyHtml = null;
    this.attachments = [];

    this.attachFile = function (filePath) {
        this.attachments.push({
            filename: path.basename(filePath),
            path: filePath
        });
    };
}

/**
 * Mail client for sending emails.
 */
async function MailClient(oAuth) {
    const oAuth2Client = new OAuth2(
        oAuth.oAuthClient,
        oAuth.oAuthClientSecret,
        'https://developers.google.com/oauthplayground',
    );

    oAuth2Client.setCredentials({
        refresh_token: oAuth.oAuthToken,
    });

    const accessToken = await new Promise((resolve, reject) => {
        oAuth2Client.getAccessToken((err, token) => {
            if (err) {
                reject(err);
            }
            resolve(token);
        });
    });

    const transporter = nodemailer.createTransport({
        service: oAuth.oAuthService,
        auth: {
            type: 'OAuth2',
            user: oAuth.oAuthMailbox,
            clientId: oAuth.oAuthClient,
            clientSecret: oAuth.oAuthClientSecret,
            refreshToken: oAuth.oAuthToken,
            accessToken: accessToken
        }
    });

    return {
        sendMail: async function (msg) {
            try {
                const mailOptions = {
                    from: msg.from.toString(),
                    to: Array.isArray(msg.to) ? msg.to.map(r => r.toString()).join(',') : msg.to,
                    cc: msg.cc ? (Array.isArray(msg.cc) ? msg.cc.map(r => r.toString()).join(',') : msg.cc) : [],
                    bcc: msg.bcc ? (Array.isArray(msg.bcc) ? msg.bcc.map(r => r.toString()).join(',') : msg.bcc) : [],
                    subject: msg.subject,
                    html: msg.bodyHtml,
                    attachments: msg.attachments
                };
                await transporter.sendMail(mailOptions);
                return {
                    status: 'Success'
                };
            } catch (err) {
                console.error('Failed to send email:', err);
                return { 
                    status: 'Failed', 
                    error: err.message, 
                    code: err.code, 
                    response: err.response 
                };
            };
        }
    };
};

async function replaceTemplatePlaceholders(template, data) {
    const query = `
        SELECT a.rlt_tb, a.search_key
        FROM tb_acn_rlt_tb a 
        LEFT JOIN tb_action b ON b.action_id = a.action_id
        WHERE (a.action_id = $1 OR b.action_code = $2)
        AND b.allow_notif = 1
    `;

    try {
        // 🔹 Fetch the related table name and search key
        const table = await pgSql.statement(query, [null, `${data.code}::${data.axn}`]);
        if (!table.length) throw new Error('No table found for given action.');

        const { rlt_tb, search_key } = table[0];
        console.log('Table:', rlt_tb);
        console.log('Search Key:', search_key);

        // 🔹 Get the notification parameters
        const notif_params = await pgSql.executeFunction('fn_notif_param_list', ['System', null, `${data.code}::${data.axn}`, null, null, null]);
        console.log('Notification Parameters:', notif_params);

        // 🔹 Extract placeholders from the template
        const templateParams = template.match(/\$\{(.*?)\}/g)?.map(param => param.replace(/\$\{|\}/g, '')) || [];
        console.log('Template Placeholders:', templateParams);

        // 🔹 Fetch the data from the target table
        const query2 = `
            SELECT *
            FROM ${rlt_tb}
            WHERE ${search_key} = $1
        `;
        const tableData = await pgSql.statement(query2, [`${data.id}`]);
        if (!tableData.length) throw new Error('No matching record found.');

        console.log('Fetched Table Data:', tableData[0]);

        // 🔹 Replace placeholders with values from `tableData`
        const result = template.replace(/\$\{(.*?)\}/g, (_, key) => {
            if (tableData[0].hasOwnProperty(key)) {
                return tableData[0][key] || ''; // Replace with value from `table2`
            }
            return data[key] || ''; // Fallback to `data`
        });

        console.log('Processed Template:', result);
        return result;
    } catch (err) {
        console.error('Error:', err);
        throw err;
    }
};



async function getMailSetting () {
    let oAuth = {}

    try {
        result = await pgSql.executeFunction('fn_get_mail_setting', [null]);
        
        oAuth.oAuthService = result.data[0].smtp_service;
        oAuth.oAuthMailbox = result.data[0].smtp_mailbox;
        oAuth.oAuthClient = result.data[0].smtp_client;
        oAuth.oAuthClientSecret = result.data[0].smtp_client_secret;
        oAuth.oAuthToken = result.data[0].smtp_token;    
        oAuth.ableMailService = result.data[0].smtp_able_service;    
    } catch (err) {
        console.error('Error fetching mail settings:', err);
        return { status: 'Failed', message: result };
    };

    if (oAuth.ableMailService !== "1") {
        return { status: 'Failed', message: 'Failed to send mail due to unable mail service!!' };
    } else {
        return oAuth;
    };
};

async function sendNotificationEmail(o, o2) {
    try {
        // 🔹 Fetch mail settings and mail details in parallel
        const [mailSetting, result] = await Promise.all([
            getMailSetting(),
            pgSql.getTable('tb_mail', `${pgSql.SQL_WHERE} mail_id = '${o.mail_id}'`, 
                ['mail_id', 'send_to', 'cc_to', 'bcc_to', 'subject', 'email_body'])
        ]);

        if (!result.length) {
            console.error('No mail record found for mail_id:', o.mail_id);
            return { status: 'Failed', message: 'Mail record not found' };
        };

        const mail = {
            send_to: result[0].send_to,
            cc_to: result[0]?.cc_to ? [].concat(result[0].cc_to) : [],
            bcc_to: result[0]?.bcc_to ? [].concat(result[0].bcc_to) : [],
            subject: result[0].subject,
            email_body: await replaceTemplatePlaceholders(result[0].email_body, o)
        };

        // 🔹 Prepare email message
        const message = new msgObject();
        message.from = new msgAddrObject(mailSetting.oAuthMailbox);
        message.to = new msgAddrObject(mail.send_to);
        message.cc = mail.cc_to;
        message.bcc = mail.bcc_to;
        message.subject = mail.subject;
        message.bodyHtml = mail.email_body;

        // 🔹 Send email
        const mailClient = await MailClient(mailSetting);
        const mailResult = await mailClient.sendMail(message);

        if (mailResult.status === 'Success') {
            try {
                await pgSql.executeStoreProc('pr_mark_email_sent', [o.current_uid, o.msg, o.mail_id]);
            } catch (err) {
                console.error('Error marking email as sent:', err);
            }

            return { status: 'Success', message: 'Email sent successfully!' };
        } else {
            console.error('Email sending failed:', mailResult.response);
            return { status: 'Failed', message: mailResult.response };
        }
    } catch (err) {
        console.error('Unexpected error in sendNotificationEmail:', err);
        return { status: 'Failed', message: err.message || 'Unknown error' };
    }
}


async function sendEmail(params) {
    
}



module.exports = {
    msgAddrObject,
    msgObject,
    MailClient,
    getMailSetting,
    sendNotificationEmail,
    sendEmail
};

