import Notification from "@/models/notification.model";
import User from "./user.model";
import Service from "@/models/service.model";
import SubService from "@/models/subService.model";
import SubServiceRequirement from "@/models/subServiceRequirement.model";

export const db = {
  User,
  Notification,
  Service,
  SubService,
  SubServiceRequirement
};
