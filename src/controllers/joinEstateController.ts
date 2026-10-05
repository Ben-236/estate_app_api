import { Request, Response } from "express";
import codes from "../utils/statusCode";
import use from "../utils/use";
import ErrorWithCode from "../utils/ErrorWithCode";
import landlordPrisma from "../config/landlordDatabase";



export const JoinEstate = use(async (req: Request, res: Response) => {
    const { estateId, unitApartmentId,  } = req.body;

    const estate = await landlordPrisma.estate.findUnique({
        where: {
            id: estateId,
        },
    });
    
    if (!estate) {
        throw new ErrorWithCode(
            "Invalid estate id",
            codes.badRequest,
        );
    }

    const unitApartment = await landlordPrisma.unitApartment.findUnique({
        where: {
            id: unitApartmentId,
        },
    });
    
    if (!unitApartment) {
        throw new ErrorWithCode(
            "Invalid unit apartment id",
            codes.badRequest,
        );
    }

    const existingJoinRequest = await landlordPrisma.estateJoinRequest.findUnique({
        where: {
            estateId,
            unitApartmentId,
        },
    });

    if (existingJoinRequest) {
        throw new ErrorWithCode(
            "Join request already exists",
            codes.conflict,
        );
    }

    await landlordPrisma.estateJoinRequest.create({
        data: {
            estateId,
            unitApartmentId,
        },
    });

    res.status(codes.created).json({
        success: true,
        message: "Join request created successfully",
        data: {
            estateId,
            unitApartmentId,
        },
    });

    return;
});


export const getJoinRequests = use(async (req: Request, res: Response) => {
    const { estateId } = req.body;

    const joinRequests = await landlordPrisma.estateJoinRequest.findMany({
        where: {
            estateId,
        },
        include: {
            user: true,
        },
    });

    res.status(codes.success).json({
        success: true,
        message: "Join requests fetched successfully",
        data: joinRequests,
    });

    return;
});


export const approveRequest = use(async (req:Request, res: Response) => {
    const { estateId, unitApartmentId } = req.body;

    const joinRequest = await landlordPrisma.estateJoinRequest.findUnique({
        where: {
            estateId,
            unitApartmentId,
        },
        include: {
            user: true,
        },
    });

    if (!joinRequest) {
        throw new ErrorWithCode(
            "Invalid join request",
            codes.badRequest,
        );
    }

    if (joinRequest.status !== "PENDING") {
        throw new ErrorWithCode(
            "Invalid join request status",
            codes.badRequest,
        );
    }

    await landlordPrisma.estateJoinRequest.update({
        where: {
            id: joinRequest.id,
        },
        data: {
            status: "APPROVED",
            reviewedAt: new Date(),
            reviewedBy: joinRequest.user.email,
        },
    });

    res.status(codes.success).json({
        success: true,
        message: "Join request approved successfully",
    });

    return;
});

export const rejectRequest = use(async (req:Request, res: Response) => {
    const { estateId, unitApartmentId } = req.body;

    const joinRequest = await landlordPrisma.estateJoinRequest.findUnique({
        where: {
            estateId,
            unitApartmentId,
        },
        include: {
            user: true,
        },
    });

    if (!joinRequest) {
        throw new ErrorWithCode(
            "Invalid join request",
            codes.badRequest,
        );
    }

    if (joinRequest.status !== "PENDING") {
        throw new ErrorWithCode(
            "Invalid join request status",
            codes.badRequest,
        );
    }

    await landlordPrisma.estateJoinRequest.update({
        where: {
            id: joinRequest.id,
        },
        data: {
            status: "REJECTED",
            reviewedAt: new Date(),
            reviewedBy: joinRequest.user.email,
        },
    });

    res.status(codes.success).json({
        success: true,
        message: "Join request rejected successfully",
    });

    return;
});

export const cancelRequest = use(async (req:Request, res: Response) => {
    const { estateId, unitApartmentId } = req.body;

    const joinRequest = await landlordPrisma.estateJoinRequest.findUnique({
        where: {
            estateId,
            unitApartmentId,
        },
        include: {
            user: true,
        },
    });

    if (!joinRequest) {
        throw new ErrorWithCode(
            "Invalid join request",
            codes.badRequest,
        );
    }

    if (joinRequest.status !== "PENDING") {
        throw new ErrorWithCode(
            "Invalid join request status",
            codes.badRequest,
        );
    }

    await landlordPrisma.estateJoinRequest.update({
        where: {
            id: joinRequest.id,
        },
        data: {
            status: "CANCELLED",
            reviewedAt: new Date(),
            reviewedBy: joinRequest.user.email,
        },
    });

    res.status(codes.success).json({
        success: true,
        message: "Join request cancelled successfully",
    });

    return;
}); 

