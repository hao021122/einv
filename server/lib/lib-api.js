const libShared = require('./lib-shared')

function libApi() {}

Object.defineProperty(libApi, 'TB_ACTION', { 
    get: function() { 
        return 'tb_action'; 
    } 
});

libApi.response = function (data, message) {
    return {
        data,
        message
    }
};

libApi.toB64 = function (o) {
    return Buffer.from(JSON.stringify(o)).toString('base64');
};

libApi.apiCaller = function() {
    /** @type {string} */
    this.api_code = null

    /** @type {string} */
    this.api_axn = null

    /** @type {object} */
    this.data = null
};

libApi.apiCallerImg = function() {
    /** @type {string} */
    this.api_code = null

    /** @type {string} */
    this.api_axn = null

    /** @type {string} */
    this.img = null

    /** @type {object} */
    this.data = null
}

libApi.apiParameterObj = function () {
    /** @type {} */
    this.params = null
    
    /** 
     * @type {Any} 
     * -- For response use
     * {
     *      "data": {
     *                  "id": 1,
     *                  "name": "John Doe",
     *               }, 
     *      "msg": "success/ failed"
     * }
    */
    this.data = null;

    /** 
     * @type {string} 
     * -- For response use
     * set "Success" if process run succesfully
     * set "Failed" if process failed
    */
    this.msg = null;
};

/**
 * 
 * @param {Object} validAxn 
 * @param {Object} o2 
 * @returns 
 */
libApi.parseParams = function (validAxn, o2) {
    let params = [];
    for (const param of validAxn.data) {
        const { action_param_name, data_type } = param;

        // Iterate over each object in the 'o2' array
        for (const obj of o2) {
            let value = obj[action_param_name]; // Access the property in each object

            if (value === undefined) {
                throw new Error(`Missing parameter: ${action_param_name}`);
            }

            // Handle the parameter data types
            switch (data_type) {
                case 'string':
                    value = libShared.toString(value);
                    break;
                case 'int':
                    value = libShared.toInt(value);
                    break;
                case 'money':
                    value = libShared.toFloat(value);
                    break;
                case 'id':
                    value = libShared.toUUID(value);
                    break;
                case 'text':
                    value = libShared.toText(value);
                    break;
                case 'dt':
                    value = libShared.toDate(value);
                    break;
                case 'dt2': 
                    value = libShared.toDateTime(value);
                    break;
                default:
                    throw new Error(`Unsupported data type: ${data_type}`);
            }

            params.push(value);
        }
    }
    return params;
};


module.exports = libApi;