class NotifyUpdateProcessor {

    getHandlerName() {
        return this.constructor.name;
    }
    
    async handleEvent(payload) {
        console.log('payload: ', payload);

    }
}

module.exports = new NotifyUpdateProcessor();