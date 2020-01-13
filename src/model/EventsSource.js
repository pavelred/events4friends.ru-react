import Event from "./Event";

class EventsSource {
  /**
   * @param {string} name название источника
   * @param {string} source ссылка на источник
   */
  constructor(name, source,) {    
    this.name = name;
    this.source = source;
  }

  /**
   * @param {string} text 
   * @private
   * @return {string|null}
   */
  _parseStart(text) {

    /**
     * @type {string|null}
     */
    let resultDate = null;

    if (text) {
      const dateFormat = /#\d\d_[а-я]+\d\d\d\d@afisha_39/;
      const regex = RegExp(dateFormat);

      if (regex.test(text)) {
        const data = regex.exec(text);

        if (data && data[0]) {
          resultDate = data[0];
        }
      } 
    }

    return resultDate;
  }

  /**
   * @param {string} text 
   * @private
   * @return {string|null}
   */
  _parseEnd(text) {

    /**
     * @type {string|null}
     */
    let resultDate = null;

    if (text) {
      const dateFormat = /#\d\d_[а-я]+\d\d\d\d@afisha_39/g;
      const matches = text.match(dateFormat);

      if (matches && matches.length > 1) {
        resultDate = matches[1];
      }
    }

    return resultDate;
  }

  /**
   * @param {string} text 
   * @private
   * @return {string}
   */
  _parseSummary(text) {
    // https://stackoverflow.com/a/8436533/1775459
    return text ? text.split('\n')[0] : "Не указано";
  }

  /**
   * @param {function} cbSuccess функция вызывается при успешном получении данных
   * @param {function} cbError функция вызывается в случае ошибки
   */
  loadEvents(cbSuccess, cbError) {
    const that = this;

    try {
      if (window.VK) {
        const vk = window.VK;
        vk.init({
          apiId: 7272040
        });
        vk.Api.call(
          'wall.get',
          {
            owner_id: -93114971,
            count: 5,
            v: "5.103"
          },
          function(r) {
            if (r.response && r.response.items && r.response.items.length) {
              let events = [];
              
              r.response.items.forEach(item => {
                console.log(item);

                const { text } = item;

                const id = "1";
                const start = that._parseStart(text);
                const end = that._parseEnd(text);
                const summary = that._parseSummary(text);
                const description = text;
                const location = "Не указано";
                const contact = "https://vk.com/afisha_39";
                const reference = "Не указано";

                const event = new Event(id, start, end, summary, description, location, contact, reference);

                events.unshift(event);
              });

              cbSuccess(events);
            } else {
              throw "No VK wall post found.";
            }
          }
        );
      } else {
        throw "No VK module found. Make sure https://vk.com/js/api/openapi.js script has been added to web page.";
      }
    }
    catch(error) {
      cbError(error);
    }
  }
}
  
export default EventsSource;