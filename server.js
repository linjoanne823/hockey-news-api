const PORT = process.env.PORT || 8000;
const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");

const app = express();

const newspapers = [
  {
    name: "ctv",
    address: "https://www.ctvnews.ca/sports",
    base: "",
  },
  {
    name: "the globe and mail",
    address: "https://www.theglobeandmail.com/sports/",
    base: "https://www.theglobeandmail.com/",
  },
  {
    name: "toronto star",
    address: "https://www.thestar.com/sports/hockey.html",
    base: "https://www.thestar.com/"
  },
  {
    name: "cbc",
    address: "https://www.cbc.ca/sports",
    base: "https://www.cbc.ca/",
  },
];
const articles = [];
newspapers.forEach((newspaper) => {
  axios.get(newspaper.address).then((response) => {
    const html = response.data;
    const $ = cheerio.load(html);
    $('a:contains("hockey")', html).each(function () {
      let title = $(this).text();
      const correction = {
          "\n": "",
          "                       " : "",
          "bid\n": ""
      }
      Object.keys(correction).forEach((key) => {
          title = title.replace(key, correction[key])
      })
      
      const url = $(this).attr("href");

      articles.push({
        title,
        url: newspaper.base + url,
        source: newspaper.name,
      });
    });
  });
});

app.get("/", (req, res) => {
  res.json("welcome to my hockey news api");
});

app.get("/news", (req, res) => {
  res.json(articles);
});

app.get("/news/:newspaperId", async (req, res) => {
  const newspaperId = req.params.newspaperId;
  const newspaperAddress = newspapers.filter(
    (newspaper) => newspaper.name === newspaperId
  )[0].address;
  const newspaperBase = newspapers.filter(
    (newspaper) => newspaper.name === newspaperId
  )[0].base;
  axios.get(newspaperAddress).then((response) => {
    const html = response.data;
    const $ = cheerio.load(html);
    const specificArticles = [];
    $('a:contains("hockey")', html).each(function () {
      const title = $(this).text();
      const url = $(this).attr("href");
      specificArticles.push({
        title,
        url: newspaperBase + url,
        source: newspaperId,
      });
    });
    res.json(specificArticles);
  });
});

app.listen(PORT, () => {
  console.log(`server running on ${PORT}`);
});
