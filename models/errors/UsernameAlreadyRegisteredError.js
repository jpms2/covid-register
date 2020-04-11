function UsernameAlreadyRegisteredError(message) {
    this.name = 'Username already registered';
    this.message = message;
    this.stack = (new Error()).stack;
}
UsernameAlreadyRegisteredError.prototype = new Error;
export default UsernameAlreadyRegisteredError