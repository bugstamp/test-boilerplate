import mongoose from 'mongoose';

mongoose.Promise = Promise;

const { ObjectId } = mongoose.Types;
// eslint-disable-next-line
ObjectId.prototype.valueOf = function () {
  return this.toString();
};

const uri = process.env.NODE_ENV === 'production'
  ? process.env.MONGOLAB_URI
  : process.env.MONGO_URI;

const options = {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
  useUnifiedTopology: true,
};

export const connectToDb = async () => {
  try {
    await mongoose.connect(uri, options);
  } catch (e) {
    throw e;
  }
};

export default mongoose;