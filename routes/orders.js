const express = require ("express");
const { Order } = require("../models/order");
const { auth, isUser, isAdmin } = require("../middleware/auth");
const moment = require("moment");

const router = require("express").Router();

// ORDERS

router.get("/", isAdmin, async(req, res) => {
  const query = req.query.new;

  try {
    const order = query
    ? await Order.find().sort({ _id: -1 }).limit(4)
    : await Order.find().sort({ _id: -1 });
  } catch (error) {
    console.log(error)
    res.status(500).send(error)
  }
})

// GET ORDER STATS

router.get("/stats", isAdmin, async (req, res) => {
    const previousMonth = moment()
    .month(moment().month() - 1)
    .set("date", 1)
    .format("YYYY-MM-DD HH:mm:ss");
  
  try {
    const orders = await Order.aggregate([
      {
        $match: { createdAt : { $gte: new Date(previousMonth) } },
      },
      {
        $project: {
          month: { $month: "$createdAt"}
        }
      },
      {
        $group: {
          _id: "$month",
          total: {$sum: 1}
        }
      }
    ]);

    res.status(200).send(orders)
  } catch (error) {
    console.log(err);
    res.status(500).send(err);   
  }
});

//GET INCOME STATS

router.get("/income/stats", isAdmin, async (req, res) => {
    const previousMonth = moment()
    .month(moment().month() - 1)
    .set("date", 1)
    .format("YYYY-MM-DD HH:mm:ss");
  
  try {
    const income = await Order.aggregate([
      {
        $match: { createdAt : { $gte: new Date(previousMonth) } },
      },
      {
        $project: {
          month: { $month: "$createdAt"},
          sales: "$total"
        }
      },
      {
        $group: {
          _id: "$month",
          total: {$sum: "$sales"},
        },
      },
    ]);

    res.status(200).send(income);
  } catch (error) {
    console.log(error);
    res.status(500).send(error);   
  }
});

// GET 1 WEEK SALES

router.get("/week-sales", isAdmin, async (req, res) => {
  const last7Days = moment()
  .day(moment().day() - 7)
  .format("YYYY-MM-DD HH:mm:ss");

try {
  const income = await Order.aggregate([
    {
      $match: { createdAt : { $gte: new Date(last7Days) } },
    },
    {
      $project: {
        day: { $dayOfWeek: "$createdAt"},
        sales: "$total"
      }
    },
    {
      $group: {
        _id: "$day",
        total: { $sum: "$sales"},
      },
    },
  ]);

  res.status(200).send(income);
} catch (error) {
  console.log(error);
  res.status(500).send(error);   
}
});

module.exports = router;