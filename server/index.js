const express = require('express');
const db = require('../db/index.js');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

//redis
// const responseTime = require('response-time')
// const redis = require('redis');
// create a new redis client and connect to our local redis instance
// const client = redis.createClient();
// // if an error occurs, print it to the console
// client.on('error', function (err) {
//     console.log("Error " + err);
// });

  
// client.on('ready',function() {
// console.log("Redis is ready");
// });

let app = express();
app.use(bodyParser.json());
// for crossoriginrequest
app.use(cors());

// app.use(responseTime());
//server static content
app.use('/rooms/:roomid', express.static(path.join(__dirname, '../client/dist')));



app.get('/reviews', function (req, res) {
    const locationId = req.query.locationId;
    // console.log('inside reviews-', locationId);
    // use the redis client 
    
    // client.get(locationId, function (error, result) {
    //     if (result) {
            // const { getFive, totalReviews, searchResultsReviewsTotal, averageRatings } = result;
        //     res.end(result);
        // } else {
            const pageIndex = Number(req.query.index);
            if (locationId === undefined) {res.sendStatus(404);return;
            }
            const startIndex = 5 * (pageIndex - 1);
            const endIndex = 5 * pageIndex;
            db.find(locationId, function (err, results) {
                if (err) {
                    res.sendStatus(404);
                }
                //get reviews of each customer
                const reviewInfo = results.map(review => {
                    return {
                        customerName: review.customerName,
                        createdAt: review.createdAt,
                        customerProfilePhotoUrl: review.customerProfilePhotoUrl,
                        customerReview: review.customerReview,}
                });
                const averageRatings = calculateRatings(results);
                let getFive = reviewInfo.slice(startIndex, endIndex);
                let totalReviews = reviewInfo.length;
                let searchResults = [];
                let searchResultsReviewsTotal = 0;
                if (req.query.keyword) {
                    searchResults = reviewInfo.filter(review => {
                        return (review['customerReview'].indexOf(req.query.keyword)) > -1;
                    });
                    getFive = searchResults.slice(startIndex, endIndex);
                    searchResultsReviewsTotal = searchResults.length;
                    // client.setex(locationId, 60, JSON.stringify({getFive, totalReviews, searchResultsReviewsTotal, averageRatings}));
                    res.json({ getFive, totalReviews, searchResultsReviewsTotal});
                } else {
                    searchResultsReviewsTotal = totalReviews;
                    // client.setex(locationId, 60, JSON.stringify({getFive, totalReviews, searchResultsReviewsTotal, averageRatings}));
                    res.json({ getFive, totalReviews, searchResultsReviewsTotal, averageRatings });
                }
            });  
        // }
    // });
})

    const calculateRatings = (results) => {
        // console.log('results inside server index-',results)
        var ratingAccuracy = { total: 0, count: 0 };
        var ratingCommunication = { total: 0, count: 0 };
        var ratingCleanliness = { total: 0, count: 0 };
        var ratingCheckIn = { total: 0, count: 0 };
        var ratingLocation = { total: 0, count: 0 };
        var ratingValue = { total: 0, count: 0 };
        for (var i = 0; i < results.length; i++) {
            if (results[i].ratingAccuracy) {
                ratingAccuracy.total += results[i].ratingAccuracy;
                ratingAccuracy.count++;
            }
            if (results[i].ratingCommunication) {
                ratingCommunication.total += results[i].ratingCommunication;
                ratingCommunication.count++;
            }
            if (results[i].ratingCleanliness) {
                ratingCleanliness.total += results[i].ratingCleanliness;
                ratingCleanliness.count++;
            }
            if (results[i].ratingCheckIn) {
                ratingCheckIn.total += results[i].ratingCheckIn;
                ratingCheckIn.count++;
            }
            if (results[i].ratingLocation) {
                ratingLocation.total += results[i].ratingLocation;
                ratingLocation.count++;
            }
            if (results[i].ratingValue) {
                ratingValue.total += results[i].ratingValue;
                ratingValue.count++;
            }
        }
        var averageRatings = {};
        averageRatings.Accuracy = +(Math.round((ratingAccuracy.total / ratingAccuracy.count) + 'e+1') + 'e-1');
        averageRatings.Communication = +(Math.round((ratingCommunication.total / ratingCommunication.count) + 'e+1') + 'e-1');
        averageRatings.Cleanliness = +(Math.round((ratingCleanliness.total / ratingCleanliness.count) + 'e+1') + 'e-1');
        averageRatings.CheckIn = +(Math.round((ratingCheckIn.total / ratingCheckIn.count) + 'e+1') + 'e-1');
        averageRatings.Location = +(Math.round((ratingLocation.total / ratingLocation.count) + 'e+1') + 'e-1');
        averageRatings.Value = +(Math.round((ratingValue.total / ratingValue.count) + 'e+1') + 'e-1');
        averageRatings.overallRating = +(Math.round(((averageRatings.Accuracy + averageRatings.Communication + averageRatings.Cleanliness + averageRatings.CheckIn +
            averageRatings.Location + averageRatings.Value) / 4) + 'e+1') + 'e-1');
        return averageRatings;
    }

    app.post('/reviews/:locationId', function (req, res) {
        db.save(req.body, function (err, results) {
            if (err) {
                console.log('error ocured in saving to db-', err);
                res.sendStatus(404);
            } else {
                console.log('results saving to db-', results);
                res.sendStatus(201);
            }

        });
    });

    let port = 3000;

    app.listen(port, function () {
        console.log(`listening on port ${port}`);

    });

    module.exports.app = app;