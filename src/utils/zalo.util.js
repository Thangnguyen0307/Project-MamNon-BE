export const zaloUtil = {
    getSenderType(event_name) {
        return event_name.split('_')[0];
    },

    getEventListeners(event_name) {
        return event_name.split('_').slice(1).join('_');
    }
}