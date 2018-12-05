import _ from "lodash";
import express from "express";

import { chalmersClient } from "../timeedit";

const router = express.Router();

router.get("/rooms", function(req, res, next) {
  const search = req.query.search;

  chalmersClient.searchRooms(search, { max: 10 })
    .then(rooms => {
      res.send({
        success: true,
        list: rooms
      });
    })
    .catch(err => {
      console.error(err);

      res.send({
        success: false,
        error: err
      });
    });
});

router.get("/rooms/times", function(req, res, next) {
  const strRoomIds = req.query.rooms;
  const date = new Date(req.query.date);

  if (!strRoomIds) {
    res.status(400);
    return res.send({
      success: false,
      error: "Invalid rooms specified in query params"
    });
  }

  const roomIds = _.split(strRoomIds, ",");

  chalmersClient.getFreeRoomTimes(roomIds, date)
    .then(times => {
      res.send({
        success: true,
        list: times
      });
    })
    .catch(err => {
      console.error(err);

      res.send({
        success: false,
        error: err
      });
    });
});

export default router;
