import { toLevelResponse } from './level.mapper.js';
import { toUserResponse } from './user.mapper.js';

export const toClassResponse = (classInstance) => {
    return {
        id: classInstance._id,
        name: classInstance.name,
        schoolYear: classInstance.schoolYear,
        level: classInstance.level ? toLevelResponse(classInstance.level) : null,
        teachers: classInstance.teachers ? classInstance.teachers.map(toUserResponse) : [],
        createdAt: classInstance.createdAt,
        updatedAt: classInstance.updatedAt
    };
};

export const toClassesResponse = (classes) => {
    return classes.map(toClassResponse);
};