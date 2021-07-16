const functions = require('firebase-functions');
const app = require('express')();
const FBAuth = require('./util/fbAuth');

const cors = require('cors');
app.use(cors());

const { db } = require('./util/admin');

const { 
    getAllPlants, 
    postOnePlant, 
    uploadPlantImg, // upload plant image
    getPlant,
    deletePlant,
    editPlant, // edit plant details
    likePlant,
    unlikePlant, 
    commentOnPlant
} = require('./handlers/plants');
const { 
    signup, 
    login, 
    uploadImage, 
    addUserDetails,
    getAuthenticatedUser,
    getUserDetails,
    markNotificationsRead 
} = require('./handlers/users');

// Plant routes
app.get('/plants', getAllPlants);
app.post('/plant', FBAuth, postOnePlant);
app.post('/plant/plantimg', uploadPlantImg); // upload plant image
app.get('/plant/:plantId', getPlant);
app.delete('/plant/:plantId', FBAuth, deletePlant);
app.post('/plant/:plantId', FBAuth, editPlant); // edit plant details
app.get('/plant/:plantId/like', FBAuth, likePlant);
app.get('/plant/:plantId/unlike', FBAuth, unlikePlant);
app.post('/plant/:plantId/comment', FBAuth, commentOnPlant);

// User routes
app.post('/signup', signup);
app.post('/login', login);
app.post('/user/image', FBAuth, uploadImage);
app.post('/user', FBAuth, addUserDetails);
app.get('/user', FBAuth, getAuthenticatedUser);
app.get('/user/:handle', getUserDetails);
app.post('/notifications', FBAuth, markNotificationsRead);

exports.api = functions.region('us-central1').https.onRequest(app);

exports.createNotificationOnLike = functions.region('us-central1').firestore.document('likes/{id}')
    .onCreate((snapshot) => {
      return db.doc(`/plants/${snapshot.data().plantId}`).get()
        .then(doc => {
            if(doc.exists && doc.data().userHandle !== snapshot.data().userHandle){
                return db.doc(`/notifications/${snapshot.id}`).set({
                    createDate: new Date().toISOString(),
                    recipient: doc.data().userHandle,
                    sender: snapshot.data().userHandle,
                    type: 'like',
                    read: false,
                    plantId: doc.id
                });
            }
        })
        .catch((err) => {
            console.error(err);
        });
    });

exports.deleteNotificationOnUnlike = functions.region('us-central1').firestore.document('likes/{id}')
    .onDelete((snapshot) => {
       return db.doc(`/notifications/${snapshot.id}`)
            .delete()
            .catch((err) => {
                console.error(err);
                return;
            });
    });

exports.createNotificationOnComment = functions.region('us-central1').firestore.document('comments/{id}')
    .onCreate((snapshot) => {
       return db.doc(`/plants/${snapshot.data().plantId}`).get()
        .then(doc => {
            if(doc.exists && doc.data().userHandle !== snapshot.data().userHandle){
                return db.doc(`/notifications/${snapshot.id}`).set({
                    createDate: new Date().toISOString(),
                    recipient: doc.data().userHandle,
                    sender: snapshot.data().userHandle,
                    type: 'comment',
                    read: false,
                    plantId: doc.id
                });
            }
        })
        .catch(err => {
            console.error(err);
            return;
        });
    });

// Change the userImage of all the post when there's a change in the userImage
exports.onUserImageChange = functions.region('us-central1').firestore.document('/users/{userId}')
    .onUpdate((change) => {
        console.log(change.before.data());
        console.log(change.after.data());
        if(change.before.data().userImage !== change.after.data().userImage){
        console.log('Image has changed');
        const batch = db.batch();
        return db.collection('plants').where('userHandle', '==', change.before.data().handle).get()
            .then((data) => {
                data.forEach((doc) => {
                    const plant = db.doc(`/plants/${doc.id}`);
                    batch.update(plant, { userImage: change.after.data().userImage});
                })
                return batch.commit();
            });
        } else return true;
    });

// Delete Likes, Comments, Notifications when a Plant is deleted
exports.onPlantDelete = functions
.region('us-central1')
.firestore.document('/plants/{plantId}')
.onDelete((snapshot, context) => {
    const plantId = context.params.plantId;
    const batch = db.batch();
    return db.collection('comments').where('plantId', '==', plantId).get()
        .then(data => {
            data.forEach(doc => {
                batch.delete(db.doc(`/comments/${doc.id}`));
            })
            return db.collection('likes').where('plantId', '==', plantId).get();
        })
        .then(data => {
            data.forEach(doc => {
                batch.delete(db.doc(`/likes/${doc.id}`));
            })
            return db.collection('notifications').where('plantId', '==', plantId).get();
        })
        .then(data => {
            data.forEach(doc => {
                batch.delete(db.doc(`/notifications/${doc.id}`));
            })
            return batch.commit();
        })
        .catch((err) => console.error(err));
})