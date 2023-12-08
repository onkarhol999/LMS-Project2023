import { model, Schema } from "mongoose";

const courseSchema = new Schema({
    title:{
       type:String,
       required: [true, 'Title is requried'],
       minLength: [8, 'Title must be atleast 8 character'],
       maxLength: [59, 'Tile should be less than 59 character'],
       trim: true,
    },
    description:{
        type:String,
        required: [true, 'description is requried'],
        minLength: [8, 'description must be atleast 8 character'],
        maxLength: [59, 'description should be less than 199 character'],
        trim: true,
    },
    category:{
        type: String,
        required: [true, 'Category is requried'],
    },
    thumbnail: {
        public_id:{
            type: String,
        },
        secure_url:{
            type: String,
        }
    },
    lectures: [
        {
          title: String,
          description: String,
          lecture: {
            public_id: String,
            secure_url: String,
          },
        },
      ],
    numberOfLectures: {
        type: Number,
        default: 0
    },
    createdBy: {
        type: String,
        // required:true,
    }
},{
    timestamps: true
});

const Course = model('Course',courseSchema);

export default Course;