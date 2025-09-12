export const toUserResponse = (user) => {
    return {
        id: user._id,
        email: user.email,
        role: user.role,
        fullName: user.fullName,
    };
};
