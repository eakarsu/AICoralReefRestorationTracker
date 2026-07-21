'use strict';
const express=require('express'); const jwt=require('jsonwebtoken'); const pool=require('../config/database');
const {JWT_SECRET,authenticateToken,requireAdmin}=require('../middleware/auth'); const {verifyPassword}=require('../services/passwords');
const router=express.Router();
router.post('/login',async(req,res)=>{try{const email=String(req.body?.email||'').trim().toLowerCase();const password=String(req.body?.password||'');if(!email||!password)return res.status(400).json({error:'email and password are required'});const row=(await pool.query('SELECT id,email,name,role,tenant_id,password_hash FROM users WHERE LOWER(email)=LOWER($1) LIMIT 1',[email])).rows[0];if(!row||!verifyPassword(password,row.password_hash))return res.status(401).json({error:'Invalid email or password'});const user={id:row.id,email:row.email,name:row.name,role:row.role,tenant_id:row.tenant_id};res.json({token:jwt.sign(user,JWT_SECRET,{algorithm:'HS256',expiresIn:'8h'}),user});}catch(e){console.error('[auth]',e.message);res.status(503).json({error:'Authentication service unavailable'});}});
router.get('/me',authenticateToken,(req,res)=>res.json(req.user));
router.get('/users',authenticateToken,requireAdmin,async(req,res)=>{try{const r=await pool.query('SELECT id,email,name,role,tenant_id,created_at FROM users WHERE tenant_id=$1 ORDER BY id',[req.user.tenant_id]);res.json(r.rows);}catch(e){res.status(503).json({error:'User directory unavailable'});}});
module.exports=router;
