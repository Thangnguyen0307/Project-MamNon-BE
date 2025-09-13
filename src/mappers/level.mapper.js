export const toLevelResponse = (level) => {
    return {
        id: level._id,
        name: level.name,
        createdAt: level.createdAt,
        updatedAt: level.updatedAt
    };
};

export const toLevelsResponse = (levels) => {
    return levels.map(toLevelResponse);
};