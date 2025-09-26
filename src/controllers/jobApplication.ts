import { Request, Response, NextFunction , Router} from "express";
import {z} from 'zod'
import { authMiddleware } from "../Middlewares/authMiddleware";
import { PrismaClient,JobType, ApplicationStatus } from "../../generated/prisma";
import { BadRequestError } from "../errors";
import { AuthenticatedRequest } from "../Middlewares/authMiddleware";


export const JobRouter = Router()
const prisma = new PrismaClient()

const jobSchema = z.object({
  company: z.string().min(1),
  title: z.string().min(1),
  location: z.string().min(1),
  jobType: z.nativeEnum(JobType),
  status: z.nativeEnum(ApplicationStatus),
  appliedDate: z.string().optional(),
  link: z.string().url(),
  notes: z.string().optional(),
//   userId: z.number(),
});

JobRouter.post('/createJob', authMiddleware, async(req:AuthenticatedRequest, res:Response, next:NextFunction) => {
    try {
        const {company, title, location, jobType, status, appliedDate, link, notes} = jobSchema.parse(req.body)
        if(!company || !title || !jobType) {
            throw new BadRequestError('company, title and jobtype are required')
        }
        const job = await prisma.jobDescription.create({
            data:{
                company, 
                title, 
                location, 
                jobType, 
                status, 
                appliedDate: appliedDate ? new Date(appliedDate): undefined, 
                link, 
                notes,
                user:{
                    connect:{id: req.user!.id}
                }
            }

        })
         res.status(201).json({ msg: "Job created successfully", job });
        
    } catch (error) {
        next(error)
    }

})

JobRouter.get('/getJobs', authMiddleware,  async(req:AuthenticatedRequest, res:Response, next:NextFunction) => {
    try {
        const userId = req.user!.id
        const{page = '1', limit ="10", jobType, ApplicationStatus, search, sortBy, order} = req.query
        const pageNumber = parseInt(page as string, 10);
        const pageSize = parseInt(limit as string, 10)

        const filters:any = {userId};
        if(ApplicationStatus) filters.ApplicationStatus = ApplicationStatus
        if(jobType) filters.jobType = jobType
        
        if(search) {
            filters.OR = [
                 { title: { contains: search as string, mode: "insensitive" } },
                 { company: { contains: search as string, mode: "insensitive" } }
            ]
        }
        const jobs = await prisma.jobDescription.findMany({
            where: filters,
            skip: (pageNumber - 1) * pageSize,
            take: pageSize,
            orderBy: sortBy ? {[sortBy as string]: order ==="desc" ? "desc": "asc"} : {createdAt: "desc"}
            // where:{userId: req.user!.id}
        })
        const totalJobs = await prisma.jobDescription.count({ where: filters });
        return res.status(200).json({
               page: pageNumber,
               limit: pageSize,
               totalJobs,
               totalPages: Math.ceil(totalJobs / pageSize),
               jobs
        })
        
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Something went wrong", error });
    } })


JobRouter.patch('/updateJob/:id', authMiddleware,  async(req: AuthenticatedRequest, res:Response, next:NextFunction) => {
    try {
        const {id} = req.params
        const {company, title, location, jobType, status, appliedDate, link, notes} = req.body
          if (jobType && !Object.values(JobType).includes(jobType)) {
              return res.status(400).json({ msg: "Invalid job type" });
            }
          if (status && !Object.values(ApplicationStatus).includes(status)) {
            return res.status(400).json({ msg: "Invalid job status" });
             }

         const existingJob = await prisma.jobDescription.findUnique({
              where: { id: Number(id) },
             });

         if (!existingJob || existingJob.userId !== req.user!.id) {
                  return res.status(404).json({ msg: "Job not found or not authorized" });
            }

        const updateJob = await prisma.jobDescription.update({
            where: {id: Number(id)},
            data: {
                company,  
                title, 
                location, 
                jobType, 
                status, 
                appliedDate: appliedDate ? new Date(appliedDate) : undefined,
                link, 
                notes
            }
        })    
        return res.status(200).json({msg: 'job updated sucessfully', updateJob})
        
    } catch (error) {
           console.error(error);
           next(error);
    }
})

JobRouter.delete('/deleteJob/:id', async(req:AuthenticatedRequest, res:Response, next:NextFunction) => {
    try {
        const {id} = req.params
        const deleteJob = await prisma.jobDescription.delete({
            where:{id: Number(id)}
        })
        return res.status(200).json({msg: 'job sucessfully deleted', deleteJob})
        
    } catch (error) {
        console.error(error)
        next(error)

    }

})
