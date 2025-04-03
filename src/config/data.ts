export interface User {
    id: number;
    name: string;
    balance: number;
    email: string;
    registration: string;
    status: string;
}

const generateMockUsers = (count: number): User[] => {
    const statuses = ["Active", "Inactive", "Pending"];
    const users: User[] = [];

    for (let i = 1; i <= count; i++) {
        users.push({
            id: i,
            name: `User ${i}`,
            balance: Math.floor(Math.random() * 10000000), // Random balance từ 0 đến 10 triệu
            email: `user${i}@example.com`,
            registration: new Date(
                2023 + Math.floor(Math.random() * 2), // 2023 hoặc 2024
                Math.floor(Math.random() * 12), // Tháng từ 0 đến 11
                Math.floor(Math.random() * 28) + 1, // Ngày từ 1 đến 28
                Math.floor(Math.random() * 24), // Giờ từ 0 đến 23
                Math.floor(Math.random() * 60) // Phút từ 0 đến 59
            ).toISOString(),
            status: statuses[Math.floor(Math.random() * statuses.length)]
        });
    }

    return users;
};

const mockUsers: User[] = generateMockUsers(120); // Tạo 120 user

export default mockUsers;
