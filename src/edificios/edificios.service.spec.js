"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const edificios_service_1 = require("./edificios.service");
describe('EdificiosService', () => {
    let service;
    beforeEach(async () => {
        const module = await testing_1.Test.createTestingModule({
            providers: [edificios_service_1.EdificiosService],
        }).compile();
        service = module.get(edificios_service_1.EdificiosService);
    });
    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
//# sourceMappingURL=edificios.service.spec.js.map