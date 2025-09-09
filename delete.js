const { MongoClient } = require('mongodb');

// Connection URI - replace with your actual credentials
const uri = "mongodb+srv://Chatme:Chatme1@cluster0.x3f1jcv.mongodb.net/registers?retryWrites=true&w=majority";

async function deleteMessagesData() {
  const client = new MongoClient(uri);
  
  try {
    // Connect to the MongoDB cluster
    await client.connect();
    console.log("Connected to MongoDB Atlas");

    // Get the database and collection
    const database = client.db('registers');
    const messagesCollection = database.collection('messages');

    // Delete all documents in the messages collection
    const deleteResult = await messagesCollection.deleteMany({});
    console.log(`Deleted ${deleteResult.deletedCount} documents from messages collection`);

    // Alternative: To drop the entire collection (including indexes)
    // await messagesCollection.drop();
    // console.log("Dropped entire messages collection");

  } catch (error) {
    console.error("Error during deletion:", error);
  } finally {
    // Close the connection
    await client.close();
    console.log("Connection closed");
  }
}

// Execute the function
deleteMessagesData();