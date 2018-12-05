import _ from "lodash";
import Promise from "bluebird";
import cheerio from "cheerio";
import dfns from "date-fns";
import qs from "query-string";
import rp from "request-promise";
import urljoin from "url-join";

const types = {
  ROOMS: 186
};

const MIN_RESERVATION_TIME = 30;

export class TimeRange {
  constructor(start, end) {
    Object.assign(this, { start, end });
  }
}

export class Reservation {
  constructor(id, startDate, endDate, courseCode, courseName, room,
              type, text, comment, teacher, className, group) {
    Object.assign(this, {
      id, startDate, endDate, courseCode, courseName, room,
      type, text, comment, teacher, className, group
    });
  }
}

export class Room {
  constructor(id, name) {
    this.id = id;
    this.type = types.ROOMS;
    this.name = name;
  }

  /**
   * Full id consists of its id and the type separated by a dot
   * @return {String} - Full id
   */
  getFullId() {
    return `${this.id}.${this.type}`;
  }
}

export default class TimeEdit {
  constructor(baseUrl) {
    this.baseUrl = baseUrl;
  }

  /**
   * Load html and return cheerio function
   * @param {String} url - URL address
   * @return {Function} - Cheerio function to manipulate loaded html
   */
  loadHtml(url) {
    return rp({
      uri: url,
      transform: body => cheerio.load(body)
    });
  }

  /**
   * Load json and return parsed object
   * @param {String} url - URL address
   * @return {Object} - Object of parsed json string
   */
  loadJSON(url) {
    return rp({
      uri: url,
      transform: body => JSON.parse(body)
    });
  }

  /**
   * Get free room times
   * @param {Rooms[]} rooms - Array of Rooms, can be fetched with 'getRooms' function
   * @return {TimeRange[]} - Array of time ranges with available times
   */
  getFreeRoomTimes(roomIds, startDate, endDate) {
    const all = _.map(roomIds, id => this.getReservations(id, startDate, endDate));

    return Promise.all(all)
      .then(res => {
        if (res.length == 0) return [];

        const times = [];

        _.each(res, (r, index) => {
          if (r.length === 0) return;

          const roomId = roomIds[index];

          let minDate = startDate || new Date();
          let maxDate = _.maxBy(r, "endDate").endDate;

          if (minDate > maxDate) minDate = maxDate;

          const perDay = {};
          _.each(r, r => {
            const currDay = dfns.startOfDay(r.startDate);

            perDay[currDay] = perDay[currDay] || [];
            perDay[currDay].push(r);
          });

          const checkTime = (start, end, times) => {
            const diff = dfns.differenceInMinutes(end, start);

            if (diff >= MIN_RESERVATION_TIME)
              times.push({
                roomId: roomId,
                range: new TimeRange(start, end)
              });
          };

          _.each(dfns.eachDay(minDate, maxDate), d => {
            const list = perDay[d] || [];

            let startOfDay = dfns.setHours(d, 8);
            let endOfDay = dfns.setHours(d, 21);
            endOfDay = dfns.setMinutes(endOfDay, 45);

            if (list.length == 0) {
              times.push({
                roomId: roomId,
                range: new TimeRange(startOfDay, endOfDay)
              });

              return;
            }

            checkTime(startOfDay, _.first(list).startDate, times);

            if (list.length > 1) {
              for (let i = 1; i < list.length; i++) {
                checkTime(list[i - 1].endDate, list[i].startDate, times);
              }
            }

            checkTime(_.last(list).endDate, endOfDay, times);
          });

        });

        return times;
      });
  }

  getReservations(roomIds, minDate, maxDate) {
    return this.loadJSON(this.getReservationsUrl(roomIds, minDate, maxDate))
      .then(json => {
        return _.map(json.reservations, r => {
          const startDate = new Date(r.startdate + " " + r.starttime);
          const endDate = new Date(r.enddate + " " + r.endtime);

          const cols = _.map(r.columns, c => _.isEmpty(c) ? undefined : c);

          return new Reservation(
            r.id, startDate, endDate,
            cols[0], cols[1], cols[2],
            cols[3], cols[4], cols[5],
            cols[6], cols[7], cols[8],
          );
        });
      });
  }

  getRooms(rooms, options = {}) {
    if (_.isString(rooms))
      rooms = [ rooms ];
    else if (!_.isArray(rooms))
      throw new Error("Invalid rooms parameter, must be string or array!");

    const promises = _.map(rooms, r => this.searchRooms(r, options));

    return Promise.all(promises)
      .then(res => _.chain(res).map(s => _.first(s)).filter().value());
  }

  searchRooms(rooms, options = {}) {
    return this.loadHtml(this.getRoomSearchUrl(rooms, options))
      .then($ => {
        const rooms = [];

        $("[data-idonly]").each((i, elem) => {
          const $elem = $(elem);
          const id = $elem.attr("data-idonly");
          const type = $elem.attr("data-type");
          const name = $elem.attr("data-name");

          rooms.push(new Room(id, name));
        });

        return rooms;
      });
  }

  getReservationsUrl(roomIds, minDate, maxDate) {
    if (!minDate)
      minDate = dfns.startOfDay(new Date());

    if (!maxDate) maxDate = dfns.addDays(minDate, 1);

    minDate = dfns.startOfDay(minDate);
    maxDate = dfns.startOfDay(maxDate);

    if (_.isDate(minDate)) minDate = minDate.getTime();
    if (_.isDate(maxDate)) maxDate = maxDate.getTime();

    const params = qs.stringify({
      h: "f",
      sid: 3,
      p: minDate + "," + maxDate,
      ox: 0,
      types: types.ROOMS,
      fe: 0,
      h2: "f",
      l: "en_US",
      objects: this.normalizeObjects(roomIds)
    });

    return urljoin(this.baseUrl, `ri.json?${params}`);
  }

  getRoomSearchUrl(rooms, options) {
    return this.getSearchUrl(rooms, types.ROOMS, options.max);
  }

  getSearchUrl(items, types, max = 15) {
    items = this.normalizeObjects(items);

    const params = qs.stringify({
      max,
      fr: "t",
      partajax: "t",
      im: "f",
      sid: "3",
      l: "en_US",
      search_text: items,
      types: types
    });

    return urljoin(this.baseUrl, `objects.html?${params}`);
  }

  normalizeObjects(objects) {
    if (_.isArray(objects))
      return _.join(objects, ",");
    else if (!_.isString(objects))
      throw new Error("Invalid objects parameter, must be string or array!");

    return objects;
  }
}

TimeEdit.getDRooms = () => {
  return [
    // NC second floor
    new Room("192433", "EG-3505"),
    new Room("192431", "EG-3503"),
    new Room("192432", "EG-3504"),
    new Room("192434", "EG-3506"),
    new Room("192421", "EG-3507"),
    new Room("192422", "EG-3508"),

    // NC first floor
    new Room("206726", "EG-2512/2513"),
    new Room("192428", "EG-2514"),
    new Room("192429", "EG-2515"),
    new Room("192430", "EG-2516"),

    // EDIT 4th floor
    new Room("192381", "EG-4205"),
    new Room("192382", "EG-4207"),

    // EDIT 5th floor
    new Room("192383", "EG-5205"),
    new Room("192384", "EG-5207"),
    new Room("192385", "EG-5209"),
    new Room("192386", "EG-5211"),
    new Room("192387", "EG-5213"),
    new Room("192388", "EG-5215"),

    // EDIT 6th floor
    new Room("192393", "EG-6205"),
    new Room("192394", "EG-6207"),
    new Room("192395", "EG-6209"),
    new Room("192396", "EG-6211"),
    new Room("192397", "EG-6213"),
    new Room("192398", "EG-6215"),
  ];
};

export const chalmersClient = new TimeEdit("https://cloud.timeedit.net/chalmers/web/public");
