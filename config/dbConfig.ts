import mongoose, { Connection } from 'mongoose';

const DB_CLOUD = process.env.CLOUD_DATABASE!.replace(
  `<PASSWORD>`,
  process.env.CLOUD_DATABASE_PASSWORD!,
);

const DB_LOCAL = process.env.LOCAL_DATABASE!.replace(
  `<PASSWORD>`,
  process.env.LOCAL_DATABASE_PASSWORD!,
);

export let localConnection: Connection;
export let cloudConnection: Connection;

const connectToDatabase = async () => {
  try {
    // await mongoose.connect(DB_CLOUD);
    localConnection = await mongoose.createConnection(DB_LOCAL).asPromise();
    console.log('MongoDB local connection established successfully');

    cloudConnection = await mongoose.createConnection(DB_CLOUD).asPromise();
    console.log('MongoDB cloud connection established successfully');

    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:, error');
  }
};

export default connectToDatabase;
