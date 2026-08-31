const https = require('https');

function searchImages(query) {
  const url = `https://unsplash.com/napi/search/photos?query=${encodeURIComponent(query)}&per_page=3`;
  return new Promise((resolve) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve(json.results.map(r => ({ id: r.id, url: r.urls.raw })));
        } catch(e) {
          resolve([]);
        }
      });
    });
  });
}

async function run() {
  console.log('Hygiene:', await searchImages('shampoo soap cosmetics'));
  console.log('Cleaning:', await searchImages('cleaning supplies detergent'));
  console.log('Drinks:', await searchImages('soda bottles water'));
  console.log('Spices:', await searchImages('spices herbs medicinal'));
  console.log('Supermarket:', await searchImages('supermarket aisle'));
}
run();
