const { user } = require("firebase-functions/lib/providers/auth");

//Checks for valid email
const isEmail = (email) => {
    const regEx = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if(email.match(regEx)) return true;
    else return false;
}

//Validation of empty strings
const isEmpty = (string) => {
    if(string.trim() === '') return true;
    else return false;
}

exports.validateSignupData = (data) => {
    let errors = {};

    if(isEmpty(data.email)) {
        errors.email = 'Must not be empty'
    } else if(!isEmail(data.email)){
        errors.email = 'Must be a valid email address'
    }

    if(isEmpty(data.password)) errors.password = 'Must not be empty'
    if(data.password !== data.confirmPassword) errors.confirmPassword = 'Password does not match';
    if(isEmpty(data.handle)) errors.handle = 'Must not be empty'

    return {
        errors,
        valid: Object.keys(errors).length === 0 ? true : false
    }
}

exports.validateLoginData = (data) => {
    let errors = {};

    if(isEmpty(data.email)) errors.email = 'Must not be empty';
    if(isEmpty(data.password)) errors.password = 'Must not be empty';

    return {
        errors,
        valid: Object.keys(errors).length === 0 ? true : false
    }
}

exports.reduceUserDetails = (data) => {
    let userDetails ={};

    if(!isEmpty(data.bio.trim())) userDetails.bio = data.bio;
    if(!isEmpty(data.website.trim())){
        if(data.website.trim().substring(0, 4) !== 'http'){
            userDetails.website = `http://${data.website.trim()}`;
        } else userDetails.website = data.website;
    }
    if(!isEmpty(data.location.trim())) userDetails.location = data.location;

    return userDetails;
}

exports.reducePlantDetails = (data) => {
    let plantDetails ={};

    if(!isEmpty(data.plantName.trim())) plantDetails.plantName = data.plantName;
    if(!isEmpty(data.phylum.trim())) plantDetails.phylum = data.phylum;
    if(!isEmpty(data.klass.trim())) plantDetails.klass = data.klass;
    if(!isEmpty(data.urder.trim())) plantDetails.urder = data.urder;
    if(!isEmpty(data.family.trim())) plantDetails.family = data.family;
    if(!isEmpty(data.genus.trim())) plantDetails.genus = data.genus;
    if(!isEmpty(data.species.trim())) userDetails.species = data.species;
    if(!isEmpty(data.caption.trim())) plantDetails.caption = data.caption;

    return plantDetails;
}

// ---

exports.validatePostPlantData = (data) => {
    let errors = {};

    if(isEmpty(data.plantName)) errors.plantName = 'Must not be empty'
    if(isEmpty(data.caption)) errors.caption = 'Must not be empty'

    return {
        errors,
        valid: Object.keys(errors).length === 0 ? true : false
    }
}