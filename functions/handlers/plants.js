const { admin, db } = require('../util/admin');
const config = require('../util/config');
const firebase = require('firebase');

const { reducePlantDetails } = require('../util/validators');

// Get all plants
exports.getAllPlants = (req, res) => {
    db
    .collection('plants')
    .orderBy('createDate', 'desc')
    .get()
    .then(data => {
        let plants = []; // initialize an empty array
        data.forEach(doc => {
            plants.push({
                plantId: doc.id,
                createDate: doc.data().createDate,
                plantName: doc.data().plantName,
                kingdom: doc.data().kingdom,
                phylum: doc.data().phylum,
                klass: doc.data().klass,
                urder: doc.data().urder,
                family: doc.data().family,
                genus: doc.data().genus,
                species: doc.data().species,
                caption: doc.data().caption,
                userHandle: doc.data().userHandle,
                userImage: doc.data().userImage,
                plantImg: doc.data().plantImg,
                likeCount: doc.data().likeCount,
                commentCount: doc.data().commentCount
            });
        });
        return res.json(plants);
    })
    .catch(err => console.error(err));
}

// Add a plant
exports.postOnePlant = (req, res) => {
    // Declare NO Plant Img
    const noPlantImg = 'no-plant-img.png'
    // End 

    const newPlant = {
        createDate: new Date().toISOString(),
        plantName: req.body.plantName,
        kingdom: 'Plantae',
        phylum: req.body.phylum,
        klass: req.body.klass,
        urder: req.body.urder,
        family: req.body.family,
        genus: req.body.genus,
        species: req.body.species,
        caption: req.body.caption,
        userHandle: req.user.handle,
        userImage: req.user.userImage,
        plantImg: `https://firebasestorage.googleapis.com/v0/b/${config.storageBucket}/o/${noPlantImg}?alt=media`,
        likeCount: 0,
        commentCount: 0
    };
    if (req.body.plantName === '') {
        return res.status(400).json({ plantName: 'Must not be empty' });
      };
    if (req.body.caption === '') {
        return res.status(400).json({ caption: 'Must not be empty' });
      };

    db
        .collection('plants')
        .add(newPlant)
        .then(doc => {
            const resPlant = newPlant;
            resPlant.plantId = doc.id;
            res.json(resPlant);
        })
        .catch(err => {
            res.status(500).json({ error: 'Something went wrong'});
            console.error(err);
        });
};

// Fetch one Plant
exports.getPlant = (req, res) => {
    let plantData = {};
    db.doc(`/plants/${req.params.plantId}`).get()
        .then(doc => {
            if(!doc.exists){
                return res.status(404).json({ error: 'Plant not found'})
            }
            plantData = doc.data();
            plantData.plantId = doc.id;
            return db
                .collection('comments')
                .orderBy('createDate', 'desc')
                .where('plantId', '==', req.params.plantId)
                .get();
        })
        .then(data => {
            plantData.comments = [];
            data.forEach(doc => {
                plantData.comments.push(doc.data())
            });
            return res.json(plantData);
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({ error: err.code });
        })
}

// Comment on a plant
exports.commentOnPlant = (req, res) => {
    if(req.body.body.trim() === '') return res.status(400).json({ comment: 'Must not be empty'});

    const newComment = {
        body: req.body.body,
        createDate: new Date().toISOString(),
        plantId: req.params.plantId,
        userHandle: req.user.handle,
        userImage: req.user.userImage
    };

    db.doc(`/plants/${req.params.plantId}`)
        .get()
        .then(doc => {
            if(!doc.exists){
                return res.status(404).json({ error: 'Plant not found' });
            }
            return doc.ref.update({ commentCount: doc.data().commentCount + 1 });
        })
        .then(() => {
            return db.collection('comments').add(newComment);
        })
        .then(() => {
            res.json(newComment);
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({ error: 'Something went wrong' });
        });
};

// Like a plant
exports.likePlant = (req, res) => {
    const likeDocument = db.collection('likes').where('userHandle', '==', req.user.handle)
        .where('plantId', '==', req.params.plantId).limit(1);
    
    const plantDocument = db.doc(`/plants/${req.params.plantId}`);

    let plantData;

    plantDocument.get()
        .then(doc => {
            if(doc.exists){
                plantData = doc.data();
                plantData.plantId = doc.id;
                return likeDocument.get();
            } else {
                return res.status(404).json({ error: 'Plant not found' });
            }
        })
        .then(data => {
            if(data.empty){
                return db.collection('likes').add({
                    plantId: req.params.plantId,
                    userHandle: req.user.handle
                })
                .then(() => {
                    plantData.likeCount++
                    return plantDocument.update({ likeCount: plantData.likeCount })
                })
                .then(() => {
                    return res.json(plantData);
                })
            } else {
                return res.status(400).json({ error: 'Plant already liked'});
            }
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({ error: err.code });
        });
};

// Unlike plant
exports.unlikePlant = (req, res) => {
    const likeDocument = db.collection('likes').where('userHandle', '==', req.user.handle)
        .where('plantId', '==', req.params.plantId).limit(1);
    
    const plantDocument = db.doc(`/plants/${req.params.plantId}`);

    let plantData;

    plantDocument
        .get()
        .then(doc => {
            if(doc.exists){
                plantData = doc.data();
                plantData.plantId = doc.id;
                return likeDocument.get();
            } else {
                return res.status(404).json({ error: 'Plant not found' });
            }
        })
        .then(data => {
            if(data.empty){
                return res.status(400).json({ error: 'Plant not liked'});
            } else {
                return db
                    .doc(`/likes/${data.docs[0].id}`)
                    .delete()
                    .then(() => {
                        plantData.likeCount--;
                        return plantDocument.update({ likeCount: plantData.likeCount});
                    })
                    .then(() => {
                        res.json(plantData);
                    })
            }
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({ error: err.code });
        });
};

// Delete a plant
exports.deletePlant = (req, res) => {
    const document = db.doc(`/plants/${req.params.plantId}`);
    document
        .get()
        .then(doc => {
            if(!doc.exists){
                return res.status(404).json({ error: 'Plant not found'});
            }
            if(doc.data().userHandle !== req.user.handle){
                return res.status(403).json({ error: 'Unauthorized' });
            } else {
                return document.delete();
            }
        })
        .then(() => {
            res.json({ message: 'Plant deleted successfully' });
        })
        .catch((err) => {
            console.error(err);
            return res.status(500).json({ error: err.code });
        });
};

// Edit a plant
exports.editPlant = (req, res) => {
    const document = db.doc(`/plants/${req.params.plantId}`);
    let plantDetails = reducePlantDetails(req.body);
    document
        .get()
        .then(doc => {
            if(!doc.exists){
                return res.status(404).json({ error: 'Plant not found'});
            }
            if(doc.data().userHandle !== req.user.handle){
                return res.status(403).json({ error: 'Unauthorized' });
            } else {
                return document.update(plantDetails);
            }
        })
        .then(() => {
            res.json({ message: 'Plant edited successfully' });
        })
        .catch((err) => {
            console.error(err);
            return res.status(500).json({ error: err.code });
        });
};

// Upload plantImg
exports.uploadPlantImg = (req, res) => {
    const BusBoy = require('busboy');
    const path = require('path');
    const os = require('os');
    const fs = require('fs');

    const busboy = new BusBoy({ headers: req.headers });

    let plantImgFilename;
    let plantImgToBeUploaded = {};
    // String for image token
    // let generatedToken = uuid();

    busboy.on('file', (fieldname, file, filename, encoding, mimetype) => {
        if (mimetype !== 'image/jpeg' && mimetype !== 'image/png') {
            return res.status(400).json({ error: 'Wrong file type submitted' });
        }

        const imageExtension = filename.split('.')[filename.split('.').length - 1];
        plantImgFilename = `${'plantimg-'}${Math.round(Math.random()*100000000000)}.${imageExtension}`;
        const filepath = path.join(os.tmpdir(), plantImgFilename);
        plantImgToBeUploaded = { filepath, mimetype };
        file.pipe(fs.createWriteStream(filepath));

    });
    busboy.on('finish', () => {
        admin
            .storage()
            .bucket()
            .upload(plantImgToBeUploaded.filepath, {
                resumable: false,
                metadata: {
                    metadata: {
                        contentType: plantImgToBeUploaded.mimetype,
                        // Generate token to be appended to plantImg
                        // firebaseStorageDownloadTokens: generatedToken,
                },
            },
        })
        .then(() => {
            const plantImg = `https://firebasestorage.googleapis.com/v0/b/${config.storageBucket}/o/${plantImgFilename}?alt=media`;
            console.log(plantImg);
            // return db.doc(`/users/${req.user.handle}`).update({ plantImg });
        })
        .then(() => {
            return res.json({ message: 'Image uploaded successfully'});
        })
        .catch(err => {
            console.error(err);
            return res.status(500).json({ error: err.code });
        });
    });
    busboy.end(req.rawBody);
};
// End plantImg