import { Body, Controller, Post, Get, UseGuards, Req, Query, Param, Put, Delete } from "@nestjs/common";
import { AdminService } from "./admin.service";
import { AuthGuard } from "@nestjs/passport";
import { AuthenticatedRequest } from "src/utils/api";
import { 
  UpdateTransactionDto, 
  UpdateUserBalanceDto, 
  UpdateUserRoleDto,
  CreatePromotionDto,
  UpdatePromotionDto,
  CreateLeaderboardDto,
  UpdateLeaderboardDto,
  StatsQueryDto,
  GameManagementDto,
  NotificationDto
} from "./dto/admin.dto";

@Controller("admin")
@UseGuards(AuthGuard('jwt'))
export class AdminController {
  constructor(
		private readonly adminService: AdminService
	) {	}

  // ============= DASHBOARD & STATISTICS =============
  
  @Get("dashboard")
  async getDashboard(
    @Req() { user }: AuthenticatedRequest
  ) {
    return this.adminService.getDashboard();
  }

  @Get("statistics")
  async getStatistics(
    @Query() query: StatsQueryDto
  ) {
    return this.adminService.getStatistics(query);
  }

  // ============= USER MANAGEMENT =============
  
  @Get("users")
  async getAllUsers(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 50,
    @Query('search') search?: string
  ) {
    return this.adminService.getAllUsers(page, limit, search);
  }

  @Get("users/:id")
  async getUserDetails(@Param('id') id: number) {
    return this.adminService.getUserDetails(id);
  }

  @Put("users/balance")
  async updateUserBalance(@Body() dto: UpdateUserBalanceDto) {
    return this.adminService.updateUserBalance(dto);
  }

  @Put("users/role")
  async updateUserRole(@Body() dto: UpdateUserRoleDto) {
    return this.adminService.updateUserRole(dto);
  }

  @Put("users/:id/ban")
  async banUser(@Param('id') id: number) {
    return this.adminService.banUser(id);
  }

  @Put("users/:id/unban")
  async unbanUser(@Param('id') id: number) {
    return this.adminService.unbanUser(id);
  }

  // ============= TRANSACTION MANAGEMENT =============
  
  @Get("transactions/pending")
  async getPendingTransactions() {
    console.log('GET /admin/transactions/pending called');
    return this.adminService.getPendingTransactions();
  }

  @Get("transactions")
  async getAllTransactions(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 50,
    @Query('type') type?: string,
    @Query('status') status?: string
  ) {
    return this.adminService.getAllTransactions(page, limit, type, status);
  }

  @Put("transactions/approve")
  async approveTransaction(@Body() dto: UpdateTransactionDto) {
    return this.adminService.updateTransactionStatus(dto);
  }

  @Put("transactions/reject")
  async rejectTransaction(@Body() dto: UpdateTransactionDto) {
    return this.adminService.updateTransactionStatus(dto);
  }

  // ============= BETS & GAMES =============
  
  @Get("bets")
  async getAllBets(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 50
  ) {
    return this.adminService.getAllBets(page, limit);
  }

  @Get("games")
  async getAllGames() {
    return this.adminService.getAllGames();
  }

  @Put("games/toggle")
  async toggleGameStatus(@Body() dto: GameManagementDto) {
    return this.adminService.toggleGameStatus(dto);
  }

  // ============= PROMOTIONS & PROMO CODES =============
  
  @Get("promotions")
  async getAllPromotions() {
    console.log('GET /admin/promotions called');
    return this.adminService.getAllPromotions();
  }

  @Post("promotions")
  async createPromotion(@Body() dto: CreatePromotionDto) {
    return this.adminService.createPromotion(dto);
  }

  @Put("promotions")
  async updatePromotion(@Body() dto: UpdatePromotionDto) {
    return this.adminService.updatePromotion(dto);
  }

  @Delete("promotions/:id")
  async deletePromotion(@Param('id') id: number) {
    return this.adminService.deletePromotion(id);
  }

  @Get("promotions/usage/:code")
  async getPromotionUsage(@Param('code') code: string) {
    return this.adminService.getPromotionUsage(code);
  }

  // ============= LEADERBOARD =============
  
  @Get("leaderboards")
  async getAllLeaderboards() {
    console.log('GET /admin/leaderboards called');
    return this.adminService.getAllLeaderboards();
  }

  @Post("leaderboards")
  async createLeaderboard(@Body() dto: CreateLeaderboardDto) {
    return this.adminService.createLeaderboard(dto);
  }

  @Put("leaderboards")
  async updateLeaderboard(@Body() dto: UpdateLeaderboardDto) {
    return this.adminService.updateLeaderboard(dto);
  }

  @Get("leaderboards/:id/participants")
  async getLeaderboardParticipants(@Param('id') id: number) {
    return this.adminService.getLeaderboardParticipants(id);
  }

  // ============= NOTIFICATIONS =============
  
  @Post("notifications")
  async sendNotification(@Body() dto: NotificationDto) {
    return this.adminService.sendNotification(dto);
  }

  // ============= SWEEP OPERATIONS (Existing) =============
  
  @Post("fetch-sweepable-users")
  async fetchSweepableUsers() {
		console.log("fetchSweepableUsers called");
    return this.adminService.fetchSweepableUsers();
  }

	@Post("sweep-from-users")
	async sweepFromUsers(@Body() body: { currency?: string }) {
		const { currency } = body;
		return this.adminService.sweepFromUsers();
	}

  // ============= SYSTEM SETTINGS =============
  
  @Get("settings")
  async getSettings() {
    console.log('GET /admin/settings called');
    return this.adminService.getSettings();
  }

  @Put("settings")
  async updateSettings(@Body() settings: any) {
    return this.adminService.updateSettings(settings);
  }

}
