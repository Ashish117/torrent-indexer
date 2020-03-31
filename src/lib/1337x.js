const TorrentSource = require("./torrentSource");
const axios = require("axios");
const { parse } = require("node-html-parser");

class Leetx extends TorrentSource {
  constructor(options) {
    super(options.name);
    this.url = options.url;
  }

  async search(query, type, page = 1, category) {
    try {
      const search_query = query.split(" ").join("+");
      const search_url = `${this.url}/${
        category ? "category-search" : "search"
      }/${search_query}/${category ? category + "/" : "/"}${page}/`;
      const torrent_content = [];

      const { data } = await axios.get(search_url, { timeout: 10000 });
      const root = parse(data).querySelectorAll(".table-list tbody tr");

      for (const element of root) {
        const a = element.querySelectorAll(".name a")[1];
        const seeds = element.querySelectorAll(".seeds")[0].text;
        const leeches = element.querySelectorAll(".leeches")[0].text;
        const size = element.querySelectorAll("td.coll-4")[0].childNodes[0]
          .text;
        const date_added = element.querySelectorAll("td.coll-date")[0].text;

        torrent_content.push({
          title: a.text.replace("⭐", "").trim(),
          category: "",
          seeds: Number(seeds),
          leechs: Number(leeches),
          date_added,
          size,
          torrent_site: this.url + a.attributes.href
        });
      }

      return this.reconstitute(torrent_content, query, type);
    } catch (err) {
      console.error(err);
      return [];
    }
  }
}

module.exports = Leetx;
