const path = require('path')
const express = require('express');
//const schedule = require('node-schedule');



const admin_controller = require('../controllers/admin-controller');

////router.get('/',admin_controller.getDataFromAPI)


/*
router.get("/",(req,res,next) => {
    admin_controller.getDataFromBTCTurkAPI(req,res,next);
    next()
})

router.get("/",(req,res,next) => {
    admin_controller.getDataFromYKAPI(req,res,next)
    res.redirect('/client')
})
*/
exports.adminGetData = async (io) => {
/*  
    const router = express.Router();

    router.get("/",(req,res,next) => {

        admin_controller.getDataFromAPI(io)
    })
*/
    admin_controller.getDataFromAPI(io)
    
}