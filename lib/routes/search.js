var Pantry = require('../models/pantry'),
    geocoder = require('geocoder'),
    extend = require("extend"),
    mongoose = require("mongoose");
    //check = require("../utils/checkParams");

module.exports = function(app) {

    var ObjectId = mongoose.Types.ObjectId;

    function makeId(idStr) {
        try {
            return ObjectId(idStr);
        } catch (_) {
            return null;
        }
    }
  /*
   * GET search page
   * later should be able to search by location, time
   */

    var dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday",
                    "Thursday", "Friday", "Saturday"];

    /**
     * A misleadingly named function. It calculates a Date whose date is
     * greater than or equal to when's, but whose day of the week,
     * hour, and minute are specified by day, hour, and minute.
     */
    function nextDate(when, day, hour, minute) {
        var next = new Date(when),
            whenDay = when.getDay();

        next.setMilliseconds(0);
        next.setSeconds(0);
        next = new Date(next.getTime() +
                        (day - whenDay + (day < whenDay ? 7 : 0)) * 86400000);

        next.setHours(hour);
        next.setMinutes(minute);

        return next;
    }

    /**
     * Note: This assumes that the server's timezone is the same as the
     * timezone in which the hours are specified.
     *
     * @param {Pantry} pantry
     * @param {Date|Number} when
     *
     * @returns {Object} Containing the keys:
     *
     *   open (boolean) - indicates whether the pantry is open at
     *   `when`
     *
     *   next (?Date)
     *
     *   ends (?Date) - If the pantry is open now, when is it closing?
     */
    function openAt(pantry, when) {
        var hours = pantry.hours;

        if (!when)
            when = new Date();
        else if (typeof when === "number")
            when = new Date(when);

        var day = when.getDay(),
            year = when.getFullYear(),
            month = when.getMonth();

        var nextOpen = null;

        for (var i = -1, len = hours.length; ++i < len;) {
            // The system apparently supports these expressions:
            //  startsOn: mm/dd/yyyy
            //  start: hh:MM
            //  end: hh:MM
            //  repeatsEvery: int (number of days)
            //  repeatsOn: (day name)
            //

            var expression = hours[i],
                // This call to Date.parse() seems to work.
                startsOn = new Date(Date.parse(expression.startsOn));

            if (startsOn > when)
                continue;

            var starts = expression.start.match(/^(\d\d):(\d\d)$/),
                ends = expression.end.match(/^(\d\d):(\d\d)$/),
                dayNum = dayNames.indexOf(expression.repeatsOn);

            if (!starts || !ends || dayNum == -1)
                continue;

            var nextStart = nextDate(when, dayNum,
                                     parseInt(starts[1], 10),
                                     parseInt(starts[2], 10)),
                nextEnd = nextDate(when, dayNum,
                                   parseInt(ends[1], 10),
                                   parseInt(ends[2], 10));

            if (nextStart < when) {
                if (nextEnd > when) {
                    return {
                        open: true,
                        ends: nextEnd
                    };
                } else {
                    nextStart = new Date(nextStart.getTime() +
                                         86400000*7);
                }
            }

            if (!nextOpen || nextStart < nextOpen)
                nextOpen = nextStart;
        }

        return {
            open: false,
            next: nextOpen
        };
    }

    function buildQuery(params, excludeNear) {
        var cond;

        if (!excludeNear && params.location) {
            var loc = params.location,
                radius = params.radius || Infinity;

            cond =
                {loc:
                 {$near: {$geometry:
                          {type: "Point",
                           coordinates: [loc.longitude, loc.lat]},
                          $maxDistance: radius}}};
        }

        if (params.id)
            (cond = cond || {})._id = {$in: params.id.split(",").map(makeId)};

        return cond;
    }

    /**
     * Build up an array of aggregation operations.
     *
     * @param params {Object} Input parameters
     */
    function buildPipeline(params) {
        var agg = [];

        if (params.location) {
            var loc = params.location;
            agg.push({
                $geoNear: {
                    maxDistance: params.radius ? params.radius : Infinity,
                    spherical: true,
                    near: {type: "Point",
                           coordinates: [loc.longitude, loc.latitude]},
                    distanceField: "distance",
                    includeLocs: "loc",
                    match: buildQuery(params, true)
                }
            });
        } else {
            agg.push({$match: buildQuery(params)});
        }

        var per_page = params.per_page || 200;
        agg.push({$limit: per_page});

        if (params.page)
            agg.push({$skip: (params.page-1)*per_page});

        if (params.fields) {
            var fields = params.fields.split(",");
            agg.push({$project: fields.reduce(function(v, f) {
                v[f] = 1;
                return v;
            }, {})});
        }

        console.log("agg:", agg);

        return agg;
    }

  app.get('/api/pantry/search', function(req, res) {
      if ('development' == app.get('env'))
          var search = function(params) {
              var d = new Date();
              Pantry.aggregate(buildPipeline(params))
                  .exec()
                  .then(function(pantries) {
                      pantries = pantries.map(function(pantry) {
                          pantry.open_status = openAt(pantry, d);
                          return pantry;
                      });
                      res.send({pantries: pantries,
                                query: params});
                  },
                        function(err) {
                            res.send({
                                error: err
                            }, 404);
                        });
          };

      var query = extend({}, req.query),
          loc = query.location;

      if (query.radius != null) {
          query.radius = parseInt(query.radius);
      }

      if (loc) {
          if (loc.latitude != null && loc.longitude != null) {
              query.location = {latitude: parseFloat(loc.latitude),
                                longitude: parseFloat(loc.longitude)};
          } else if (loc.term) {
              geocoder.geocode(loc.term, function(err, data) {
                  if (err != null || data == null || data.results == null || data.results[0] == null) {
                      res.send('unable to geocode address', 500);
                      app.log.error('Unable to geocode address: ' + loc.term);
                  } else {
                      var location = data.results[0].geometry.location;
                      query.location = {latitude: location.lat,
                                        longitude: location.lng};
                      search(query);
                      return;
                  }
              });
          }
      }

      search(query);
  });

};
