import { Response, Request, NextFunction, RequestHandler } from "express";
import { Document, Model, PopulateOptions } from "mongoose";
import { AppError } from "../utilities/appError";
import { catchAsync } from "../utilities/catchAsync";

const getAll = <T extends Document>(Model: Model<T>): RequestHandler =>
  catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const documents = await Model.find();
    res.status(200).json({
      status: "success",
      results: documents.length,
      data: {
        documents,
      },
    });
  });

const createOne = <T extends Document>(
  Model: Model<T>,
  excludeFields?: string[],
): RequestHandler =>
  catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    if (excludeFields?.length)
      Object.keys(req.body).forEach((key) => {
        if (excludeFields.includes(key)) delete req.body[key];
      });

    const document = await Model.create(req.body);
    res.status(201).json({
      status: "success",
      data: {
        document,
      },
    });
  });

const getOne = <T extends Document>(
  Model: Model<T>,
  populateOptions?: PopulateOptions,
): RequestHandler =>
  catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    let query = Model.findById(id);
    if (populateOptions) query = query.populate(populateOptions);
    const document = await query;
    if (!document) {
      return next(new AppError("No document found with that ID", 404));
    }
    res.status(200).json({
      status: "success",
      data: {
        document,
      },
    });
  });

const deleteOne = <T extends Document>(Model: Model<T>): RequestHandler =>
  catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const document = await Model.findByIdAndDelete(req.params.id);
    if (!document) {
      return next(new AppError("No document found with that ID", 404));
    }
    res.status(204).json({
      status: "success",
      data: null,
    });
  });

const updateOne = <T extends Document>(
  Model: Model<T>,
  excludeFields?: string[],
): RequestHandler =>
  catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    if (excludeFields?.length)
      Object.keys(req.body).forEach((key) => {
        if (excludeFields.includes(key)) delete req.body[key];
      });

    const document = await Model.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!document)
      return next(new AppError("No document has been found with that id", 404));

    res.status(200).json({
      status: "success",
      data: {
        data: document,
      },
    });
  });
const factory = {
  getAll,
  getOne,
  createOne,
  updateOne,
  deleteOne,
};

export default factory;
