import express from "express";
import cors from "cors";
import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { createServer } from "http"; 
import { Server } from "socket.io";   

const app = express();
const httpServer = createServer(app); 
const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || "mecanica-leoncio-secret-key-123";

// Configuração do Socket.io para Notificações e Atualização Automática
const io = new Server(httpServer, {
  cors: {
    origin: "*", 
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE"]
  }
});

app.use(cors());
app.use(express.json());

// ----------------------------------------------------------------
// 1. AUTENTICAÇÃO E USUÁRIOS
// ----------------------------------------------------------------

app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(401).json({ error: "E-mail ou senha incorretos." });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ error: "E-mail ou senha incorretos." });

    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: "1d" });
    res.json({ 
      user: { id: user.id, name: user.name, email: user.email, role: user.role }, 
      token 
    });
  } catch (error) {
    res.status(500).json({ error: "Erro interno no login." });
  }
});

app.post("/users/mechanics", async (req, res) => {
  const { name, email, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  try {
    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword, role: "mechanic" }
    });
    res.status(201).json(user);
  } catch (e) { res.status(400).json({ error: "Erro ao criar funcionário" }); }
});

// ----------------------------------------------------------------
// 2. ESTOQUE DE PEÇAS
// ----------------------------------------------------------------

app.get("/parts", async (_, res) => {
  const data = await prisma.part.findMany({ orderBy: { createdAt: 'desc' } });
  res.json(data);
});

app.post("/parts", async (req, res) => {
  try {
    const data = req.body;
    const part = await prisma.part.create({
      data: { 
        ...data, 
        quantity: Number(data.quantity), 
        minQuantity: Number(data.minQuantity), 
        purchasePrice: Number(data.purchasePrice), 
        markup: Number(data.markup), 
        price: Number(data.price) 
      }
    });
    res.status(201).json(part);
  } catch (e) { res.status(400).json({ error: "Erro ao criar peça" }); }
});

// ----------------------------------------------------------------
// 3. VEÍCULOS
// ----------------------------------------------------------------

app.get("/vehicles", async (_, res) => {
  const data = await prisma.vehicle.findMany({ orderBy: { createdAt: 'desc' } });
  res.json(data);
});

app.post("/vehicles", async (req, res) => {
  try {
    const vehicle = await prisma.vehicle.create({ 
        data: { ...req.body, year: Number(req.body.year) } 
    });
    res.status(201).json(vehicle);
  } catch (e) { res.status(400).json({ error: "Erro ao criar veículo" }); }
});

// ----------------------------------------------------------------
// 4. SERVIÇOS (ORDENS DE SERVIÇO)
// ----------------------------------------------------------------

app.get("/services", async (_, res) => {
  const data = await prisma.service.findMany({ 
    include: { vehicle: true }, 
    orderBy: { startDate: 'desc' } 
  });
  res.json(data);
});

// ROTA QUE O FUNCIONÁRIO USA (Cria o serviço e avisa a TV na hora)
app.post("/services", async (req, res) => {
  const { vehicleId, tempPlate, description, mechanicId, notes } = req.body;
  
  try {
    const service = await prisma.service.create({
      data: {
        description,
        mechanicId,
        vehicleId: vehicleId || null,
        tempPlate: tempPlate || null,
        status: "pending_approval", 
        totalCost: 0,
        notes: notes || ""
      },
      include: { vehicle: true } // Inclui o veículo para a TV mostrar o nome/placa certo
    });

    // 1. Grita para o DataContext atualizar a lista na TV sem dar F5
    io.emit("novo-servico-full", service); 

    // 2. Grita para o App.tsx mostrar o balão de alerta (Notificação)
    io.emit("novo-servico", {
      description: service.description,
      plate: tempPlate || (service.vehicle ? service.vehicle.plate : "Cadastrada")
    });

    res.status(201).json(service);
  } catch (e) { 
    console.error(e);
    res.status(400).json({ error: "Erro ao criar serviço" }); 
  }
});

// ROTA QUE O PATRÃO USA (Aprova e dá o preço final)
app.patch("/services/:id/approve", async (req, res) => {
  const { id } = req.params;
  const { totalCost } = req.body;

  try {
    const service = await prisma.service.update({
      where: { id },
      data: {
        totalCost: Number(totalCost),
        status: "completed", 
        endDate: new Date()
      },
      include: { vehicle: true }
    });

    // Avisa o sistema que o serviço foi atualizado (remove o botão de aprovar da TV)
    io.emit("servico-atualizado", service);

    res.json(service);
  } catch (error) {
    res.status(400).json({ error: "Erro ao aprovar serviço" });
  }
});

app.delete("/services/:id", async (req, res) => {
  try {
    await prisma.service.delete({ where: { id: req.params.id } });
    res.sendStatus(204);
  } catch (e) { res.status(400).json({ error: "Erro ao deletar" }); }
});

// ----------------------------------------------------------------
// 5. DASHBOARD E ESTATÍSTICAS
// ----------------------------------------------------------------

app.get("/dashboard-stats", async (_, res) => {
  try {
    const revenue = await prisma.service.aggregate({ 
      _sum: { totalCost: true }, 
      where: { status: "completed" } 
    });
    const activeOS = await prisma.service.count({ where: { status: "in-progress" } });
    const pendingApproval = await prisma.service.count({ where: { status: "pending_approval" } });
    const vehiclesCount = await prisma.vehicle.count();

    res.json({
      revenue: revenue._sum.totalCost || 0,
      activeOS,
      pendingApproval,
      vehicles: vehiclesCount
    });
  } catch (e) { res.status(500).send(e); }
});

// ----------------------------------------------------------------
// INICIALIZAÇÃO DO SERVIDOR
// ----------------------------------------------------------------

const PORT = 3333;

// IMPORTANTE: Ouvir em 0.0.0.0 para TV e Celular encontrarem o PC na rede
httpServer.listen(PORT, "0.0.0.0", () => {
  console.log(`
  🚀 SERVIDOR LEÔNCIO MEC ONLINE
  -----------------------------------------
  PORTA: ${PORT}
  SISTEMA DE NOTIFICAÇÕES: ATIVO 🔔
  ATUALIZAÇÃO SEM F5: ATIVA ⚡
  -----------------------------------------
  `);
});