import { Request, Response } from "express";
import codes from "../utils/statusCode";
import { generateSecureRandomString, getFrontendUrl } from "../utils/function";
import use from "../utils/use";
import ErrorWithCode from "../utils/ErrorWithCode";
import landlordPrisma from "../config/landlordDatabase";


export const createRepairRequest = use(async (req: Request, res: Response) => {
    const { estateId, unitApartmentId, issueType, maintainer, issueDocument, notes } = req.body;

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

    const existingRepairRequest = await landlordPrisma.repairRequest.findUnique({
        where: {
            estateId,
            unitApartmentId,
        },
    });

    if (existingRepairRequest) {
        throw new ErrorWithCode(
            "Repair request already exists",
            codes.conflict,
        );
    }

    await landlordPrisma.repairRequest.create({
        data: {
            estateId,
            unitApartmentId,
            issueType,
            maintainer,
            issueDocument,
            notes,
        },
    });

    res.status(codes.created).json({
        success: true,
        message: "Repair request created successfully",
        data: {
            estateId,
            unitApartmentId,
        },
    });

    return;
});

export const editRepairRequest = use(async (req: Request, res: Response) => {
    const { id, issueType, maintainer, issueDocument, notes } = req.body;

    const repairRequest = await landlordPrisma.repairRequest.findUnique({
        where: {
            id,
        },
        include: {
            user: true,
        },
    });

    if (!repairRequest) {
        throw new ErrorWithCode(
            "Invalid repair request",
            codes.badRequest,
        );
    }

    if (repairRequest.status !== "PENDING") {
        throw new ErrorWithCode(
            "Invalid repair request status",
            codes.badRequest,
        );
    }

    await landlordPrisma.repairRequest.update({
        where: {
            id: repairRequest.id,
        },
        data: {
            issueType,
            maintainer,
            issueDocument,
            notes,
        },
    });

    res.status(codes.success).json({
        success: true,
        message: "Repair request edited successfully",
    });

    return;
});


export const getRepairRequests = use(async (req: Request, res: Response) => {
    const { estateId } = req.body;

    const repairRequests = await landlordPrisma.repairRequest.findMany({
        where: {
            estateId,
        },
        include: {
            user: true,
        },
    });

    res.status(codes.success).json({
        success: true,
        message: "Repair requests fetched successfully",
        data: repairRequests,
    });

    return;
});


export const approveRequest = use(async (req:Request, res: Response) => {
    const { estateId, unitApartmentId } = req.body;

    const repairRequest = await landlordPrisma.repairRequest.findUnique({
        where: {
            estateId,
            unitApartmentId,
        },
        include: {
            user: true,
        },
    });

    if (!repairRequest) {
        throw new ErrorWithCode(
            "Invalid repair request",
            codes.badRequest,
        );
    }

    if (repairRequest.status !== "PENDING") {
        throw new ErrorWithCode(
            "Invalid repair request status",
            codes.badRequest,
        );
    }

    await landlordPrisma.repairRequest.update({
        where: {
            id: repairRequest.id,
        },
        data: {
            status: "APPROVED",
            reviewedAt: new Date(),
            reviewedBy: repairRequest.user.email,
        },
    });

    res.status(codes.success).json({
        success: true,
        message: "Repair request approved successfully",
    });

    return;
});