function InternalError(message) {
    this.name = 'Internal error';
    this.message = message;
}
InternalError.prototype = new Error;
export default InternalError;