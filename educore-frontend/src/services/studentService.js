import api from "../api/axios";

export const getStudents = async (search = "", page = 1, limit = 10) => {

    const response = await api.get(

        "/students",

        {

            params: {

                search,

                page,

                limit

            }

        }

    );

    // Keep the complete paginated response so consumers can access
    // data, total, page, limit and totalPages.
    return response.data;

};

export const searchStudents = async (searchTerm) => {

    const response = await api.get(
        `/students/search?search=${searchTerm}`
    );

    return response.data.data;

};

export const createStudent = async (studentData) => {

    const response = await api.post(

        "/students",

        studentData

    );

    return response.data;

};

export const getStudentById = async (id) => {

    const response = await api.get(

        `/students/${id}`

    );

    return response.data.data;

};

export const updateStudent = async ({ id, data }) => {

    const response = await api.put(

        `/students/${id}`,

        data

    );

    return response.data.data;

};

export const deactivateStudent = async (id) => {

    const response = await api.patch(

        `/students/${id}/deactivate`

    );

    return response.data;

};

export const getStudent = async (id) => {

    const response = await api.get(

        `/students/${id}`

    );

    return response.data.data;

};
