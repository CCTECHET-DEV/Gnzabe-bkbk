import { Request, Response, NextFunction, RequestHandler } from 'express';
import Jwt from 'jsonwebtoken';
import { AuthService } from '../services/auth.service';
import { AppError } from '../utilities/appError';
import { catchAsync } from '../utilities/catchAsync';
import { Document, Model } from 'mongoose';
import { IUser } from '../interfaces/userInterface';

export function createAuthController<T extends { password?: string }>(
  Model: any,
) {
  const service = new AuthService(Model);

  return {
    signup: catchAsync(
      async (req: Request, res: Response, next: NextFunction) => {
        const response = await service.signup(req.body);
        res
          .status(201)
          .cookie('jwt', response.token, cookieOptions(req))
          .json({
            status: 'success',
            token: response.token,
            data: {
              document: response.document,
            },
          });
      },
    ),

    // login: async (req: Request, res: Response, next: NextFunction) => {
    //   try {
    //     const { email, password } = req.body;
    //     if (!email || !password)
    //       return next(new AppError('Please provide email and password', 400));

    //     const token = await service.login(email, password);
    //     res
    //       .status(200)
    //       .cookie('jwt', token, cookieOptions(req))
    //       .json({ status: 'success', token });
    //   } catch (err: any) {
    //     next(new AppError(err.message, 401));
    //   }
    // },

    logout: (req: Request, res: Response) => {
      res
        .cookie('jwt', 'loggedout', {
          expires: new Date(Date.now() + 1_000),
          httpOnly: true,
        })
        .status(200)
        .json({ status: 'success', message: 'Logged out successfully' });
    },
  };
}
// const createSingupController = <T extends Document>(
//   Model: Model<T>,
//   excludeFields?: string[],
// ): RequestHandler =>
//   catchAsync(async (req: Request, res: Response, next: NextFunction) => {
//     if (excludeFields?.length)
//       Object.keys(req.body).forEach((key) => {
//         if (excludeFields.includes(key)) delete req.body[key];
//       });

//     const document = await Model.create(req.body);
//     const token = signToken((document._id as string).toString());
//     res.cookie('jwt', token, cookieOptions(req));
//     res.status(201).json({
//       status: 'success',
//       token,
//       data: {
//         document,
//       },
//     });
//   });

const createSignupController = <T extends Document>(
  Model: Model<T>,
  allowedFields?: string[],
): RequestHandler =>
  catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    let filteredBody = req.body;

    if (allowedFields?.length) {
      filteredBody = Object.fromEntries(
        allowedFields
          .filter((key) => key in req.body)
          .map((key) => [key, req.body[key]]),
      );
    }

    const document = await Model.create(filteredBody);
    const token = signToken((document._id as string).toString());

    res.cookie('jwt', token, cookieOptions(req));
    res.status(201).json({
      status: 'success',
      token,
      data: {
        document,
      },
    });
  });

// const createLoginController = <T extends Document>(
//   Model: Model<IUser>,
//   requiredFields: string[],
//   findBy: string[],
// ): RequestHandler =>
//   catchAsync(async (req: Request, res: Response, next: NextFunction) => {
//     const { email, password } = req.body;
//     if (!email || !password)
//       return next(new AppError('Please provide email and password', 400));

//     const document = await Model.findOne({ email }).select('+password');
//     if (
//       !document ||
//       !(await document.isPasswordCorrect(password, document.password))
//     )
//       return next(new AppError('Incorrect email or password', 401));

//     //  NOTE check if the documet is active verified or not

//     const token = signToken((document._id as string).toString());
//     res
//       .status(200)
//       .cookie('jwt', token, cookieOptions(req))
//       .json({ status: 'success', token, data: { document } });
//   });

const createLoginController = <T extends Document>(
  Model: Model<IUser>,
  requiredFields: string[],
  findBy: string[],
): RequestHandler =>
  catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    // 1. Validate required fields
    const missingFields = requiredFields.filter((field) => !req.body[field]);
    if (missingFields.length > 0) {
      return next(
        new AppError(
          `Missing required field(s): ${missingFields.join(', ')}`,
          400,
        ),
      );
    }

    // 2. Build dynamic query filter from findBy array
    const filter: Record<string, any> = {};
    for (const key of findBy) {
      if (req.body[key]) {
        filter[key] = req.body[key];
      }
    }

    if (Object.keys(filter).length === 0) {
      return next(
        new AppError(
          `At least one valid identifier is required: ${findBy.join(', ')}`,
          400,
        ),
      );
    }

    // 3. Fetch document by filter
    const document = await Model.findOne(filter).select('+password');
    const password = req.body.password;

    if (
      !document ||
      !(await document.isPasswordCorrect(password, document.password))
    ) {
      return next(new AppError('Incorrect credentials', 401));
    }

    // 4. Generate token
    const token = signToken((document._id as string).toString());
    res
      .status(200)
      .cookie('jwt', token, cookieOptions(req))
      .json({ status: 'success', token, data: { document } });
  });

function cookieOptions(req: Request) {
  return {
    expires: new Date(
      Date.now() +
        Number(process.env.JWT_COOKIE_EXPIRES_IN) * 24 * 60 * 60 * 1_000,
    ),
    httpOnly: true,
    sameSite: 'lax' as const,
    // secure: req.secure || req.headers['x-forwarded-proto'] === 'https',
    // domain: '.yourdomain.com',
  };
}
function signToken(id: string): string {
  return Jwt.sign({ id }, process.env.JWT_SECRET!, {
    expiresIn: parseInt(process.env.JWT_EXPIRES_IN!, 10),
  });
}
const factory = {
  createSignupController,
  createLoginController,
};
export default factory;
