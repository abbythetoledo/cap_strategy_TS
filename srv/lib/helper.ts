module.exports = class Helper {

    static getSystemDateTime(format : string) : string {
        return format === "ISO" ? new Date().toISOString() : new Date().toLocaleDateString(format);
    }
}