/* eslint-disable snakecasejs/snakecasejs */
const { v4 } = require("uuid");

class Event {
    type;

    constructor(payload) {
        this.id = v4();
        this.appId = process.env.APP_NAME;
        this.fired_at = new Date();
        this.payload = payload;
    }

    getId() {
        return this.id;
    }

    getType() {
        return this.type;
    }

    getFiredAt() {
        return this.fired_at;
    }
    
    getBody() {
        throw new Error("Method not implemented");
    }

    getHeaders() {
        return {
            type: this.getType(),
            content_type: "application/json",
        };
    }

    getPayload() {
        return {
            uuid: this.getId(),
            fired_at: this.getFiredAt(),
            ...this.getBody()
        };
    }

    getProperties() {
        return {
            messageId: this.getId(),
            type: this.getType(),
            appId: this.appId,
            contentType: "application/json",
            headers: this.getHeaders()
        };
    }
}

module.exports = {
    Event
};