const { createClient } = require("@astrajs/collections");

exports.handler = async function (event, context) {
  const astraClient = await createClient({
    astraDatabaseId: process.env.ASTRA_DB_ID,
    astraDatabaseRegion: process.env.ASTRA_DB_REGION,
    applicationtoken: process.env.ASTRA_DB_APPLICATION_TOKEN,
  });

  const messagesCollection = astraClient
    .namespace(process.env.ASTRA_DB_KEYSPACE)
    .collection("snacks");
};
