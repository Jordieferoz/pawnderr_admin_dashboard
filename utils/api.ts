import { TResponse } from "../types";
import {
  globalGetService,
  globalPostService,
  globalPutService,
} from "./globalApiService";

export const authLogin = (payload: {
  email: string;
  password: string;
}): Promise<TResponse<any>> => {
  return new Promise((resolve, reject) => {
    globalPostService<any, any>(`auth/login`, payload)
      .then((response) => {
        resolve(response);
      })
      .catch((err) => {
        reject(err);
      });
  });
};

export const authLogout = (): Promise<TResponse<any>> => {
  return new Promise((resolve, reject) => {
    globalPostService<any, any>(`auth/logout`, {})
      .then((response) => {
        resolve(response);
      })
      .catch((err) => {
        reject(err);
      });
  });
};

export const authRefreshToken = (payload: {
  refreshToken: string;
}): Promise<TResponse<any>> => {
  return new Promise((resolve, reject) => {
    globalPostService<any, any>(`auth/refresh-token`, payload)
      .then((response) => {
        resolve(response);
      })
      .catch((err) => {
        reject(err);
      });
  });
};

export const authMe = (): Promise<TResponse<any>> => {
  return new Promise((resolve, reject) => {
    globalGetService<any, any>(`auth/me`, {})
      .then((response) => {
        resolve(response);
      })
      .catch((err) => {
        reject(err);
      });
  });
};

export const fetchUsers = (params?: {
  is_premium?: boolean;
  is_active?: boolean;
  page?: number;
  limit?: number;
  sort?: string;
  order?: string;
}): Promise<TResponse<any>> => {
  return new Promise((resolve, reject) => {
    globalGetService<any, any>(`users`, params)
      .then((response) => {
        resolve(response);
      })
      .catch((err) => {
        reject(err);
      });
  });
};

export const fetchUserDetails = (userId: number): Promise<TResponse<any>> => {
  return new Promise((resolve, reject) => {
    globalGetService<any, any>(`users/${userId}`, {})
      .then((response) => {
        resolve(response);
      })
      .catch((err) => {
        reject(err);
      });
  });
};

export const blockUser = (userId: number): Promise<TResponse<any>> => {
  return new Promise((resolve, reject) => {
    globalPutService<any, any>(`users/${userId}/block`, {})
      .then((response) => {
        resolve(response);
      })
      .catch((err) => {
        reject(err);
      });
  });
};
export const unBlockUser = (userId: number): Promise<TResponse<any>> => {
  return new Promise((resolve, reject) => {
    globalPutService<any, any>(`users/${userId}/unblock`, {})
      .then((response) => {
        resolve(response);
      })
      .catch((err) => {
        reject(err);
      });
  });
};

export const fetchSubscriptions = (params?: {
  status?: string;
  user_id?: number;
  page?: number;
  limit?: number;
  sort?: string;
  order?: string;
}): Promise<TResponse<any>> => {
  return new Promise((resolve, reject) => {
    globalGetService<any, any>(`subscriptions`, params)
      .then((response) => {
        resolve(response);
      })
      .catch((err) => {
        reject(err);
      });
  });
};

export const fetchMaintenanceStatus = (): Promise<TResponse<any>> => {
  return new Promise((resolve, reject) => {
    globalGetService<any, any>(`settings/maintenance/status`, null)
      .then((response) => {
        resolve(response);
      })
      .catch((err) => {
        reject(err);
      });
  });
};

export const setMaintenanceMode = (payload: {
  enabled: boolean;
}): Promise<TResponse<any>> => {
  return new Promise((resolve, reject) => {
    globalPostService<any, any>(`settings/maintenance`, payload)
      .then((response) => {
        resolve(response);
      })
      .catch((err) => {
        reject(err);
      });
  });
};

export const fetchUserPets = (
  userId: number,
  params?: {
    page?: number;
    limit?: number;
    sort?: string;
    order?: string;
  }
): Promise<TResponse<any>> => {
  return new Promise((resolve, reject) => {
    globalGetService<any, any>(`pets/user/${userId}`, params || { page: 1, limit: 10, sort: 'created_at', order: 'DESC' })
      .then((response) => {
        resolve(response);
      })
      .catch((err) => {
        reject(err);
      });
  });
};

export const updateFoundingDog = (petId: number, is_founding_dog: boolean): Promise<TResponse<any>> => {
  return new Promise((resolve, reject) => {
    globalPutService<any, any>(`pets/${petId}/founding-dog`, { is_founding_dog })
      .then((response) => {
        resolve(response);
      })
      .catch((err) => {
        reject(err);
      });
  });
};

export const verifyPet = (petId: number): Promise<TResponse<any>> => {
  return new Promise((resolve, reject) => {
    globalPutService<any, any>(`pets/${petId}/verify`, {})
      .then((response) => {
        resolve(response);
      })
      .catch((err) => {
        reject(err);
      });
  });
};

export const unverifyPet = (petId: number): Promise<TResponse<any>> => {
  return new Promise((resolve, reject) => {
    globalPutService<any, any>(`pets/${petId}/unverify`, {})
      .then((response) => {
        resolve(response);
      })
      .catch((err) => {
        reject(err);
      });
  });
};

export const fetchPetRegistrationData = (): Promise<TResponse<any>> => {
  return new Promise((resolve, reject) => {
    globalGetService<any, any>(`pets/registration-data`, {})
      .then((response) => {
        resolve(response);
      })
      .catch((err) => {
        reject(err);
      });
  });
};
