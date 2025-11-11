import * as functions from 'firebase-functions';
import { initializeApp } from 'firebase-admin/app';
initializeApp();
export const authUserCreated = functions.auth.user().onCreate((user) => {
    functions.logger.info('User created', { uid: user.uid, email: user.email });
});
export const authUserDeleted = functions.auth.user().onDelete((user) => {
    functions.logger.info('User deleted', { uid: user.uid, email: user.email });
});
//# sourceMappingURL=index.js.map