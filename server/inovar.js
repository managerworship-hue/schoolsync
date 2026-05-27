import axios from 'axios';
import { wrapper } from 'axios-cookiejar-support';
import { CookieJar } from 'tough-cookie';
import * as cheerio from 'cheerio';

export async function scrapeInovarSchedule(schoolUrl, username, password) {
  const jar = new CookieJar();
  const client = wrapper(axios.create({ jar, withCredentials: true }));
  
  // Normalizar URL da escola
  let baseUrl = schoolUrl.trim();
  if (!baseUrl.startsWith('http')) baseUrl = 'https://' + baseUrl;
  if (!baseUrl.endsWith('/')) baseUrl += '/';
  
  try {
    // 1. Aceder à página de login para capturar cookies iniciais e tokens de formulário ASP.NET
    console.log(`[Inovar Scraper] Acedendo a ${baseUrl}...`);
    const loginPageRes = await client.get(baseUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    const $login = cheerio.load(loginPageRes.data);
    
    // Obter os campos ocultos do ASP.NET WebForms (ViewState, EventValidation, etc.)
    const viewState = $login('#__VIEWSTATE').val() || '';
    const viewStateGenerator = $login('#__VIEWSTATEGENERATOR').val() || '';
    const eventValidation = $login('#__EVENTVALIDATION').val() || '';
    
    // Encontrar os nomes dos campos de utilizador e senha, pois podem variar
    // Normalmente no Inovar: ctl00$ContentPlaceHolder1$txtLogin e ctl00$ContentPlaceHolder1$txtPassword
    const loginInputName = $login('input[type="text"]').attr('name') || 'ctl00$ContentPlaceHolder1$txtLogin';
    const passwordInputName = $login('input[type="password"]').attr('name') || 'ctl00$ContentPlaceHolder1$txtPassword';
    const loginButtonName = $login('input[type="submit"]').attr('name') || 'ctl00$ContentPlaceHolder1$btnLogin';

    // Construir o payload de login
    const loginData = new URLSearchParams();
    loginData.append('__EVENTTARGET', '');
    loginData.append('__EVENTARGUMENT', '');
    loginData.append('__VIEWSTATE', viewState);
    loginData.append('__VIEWSTATEGENERATOR', viewStateGenerator);
    loginData.append('__EVENTVALIDATION', eventValidation);
    loginData.append(loginInputName, username);
    loginData.append(passwordInputName, password);
    loginData.append(loginButtonName, 'Entrar');

    console.log(`[Inovar Scraper] Tentando login com ${username}...`);
    // 2. Efetuar Login
    const loginPostRes = await client.post(baseUrl, loginData.toString(), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Referer': baseUrl
      }
    });

    // Validar se o login teve sucesso (geralmente redireciona ou não tem mais os inputs de login)
    const $dashboard = cheerio.load(loginPostRes.data);
    const loginFailed = $dashboard('input[type="password"]').length > 0;
    
    if (loginFailed) {
      throw new Error('Credenciais inválidas ou o layout do portal não é suportado.');
    }

    // 3. Aceder à página de horários
    // O Inovar geralmente coloca o horário em /inovarconsulta/app/horario.aspx ou similar
    // Como a rota exata pode variar (v6 vs v7), procuramos um link no menu
    let scheduleUrl = '';
    $dashboard('a').each((i, el) => {
      const href = $dashboard(el).attr('href');
      const text = $dashboard(el).text().toLowerCase();
      if (href && (text.includes('horário') || text.includes('horario'))) {
        scheduleUrl = href;
      }
    });

    if (!scheduleUrl) {
      // Tentar rota padrão comum
      scheduleUrl = 'app/horario.aspx';
    }

    const fullScheduleUrl = new URL(scheduleUrl, baseUrl).toString();
    console.log(`[Inovar Scraper] Obtendo horário em ${fullScheduleUrl}...`);
    
    const scheduleRes = await client.get(fullScheduleUrl, {
      headers: { 'Referer': baseUrl }
    });

    // 4. Extrair dados do horário
    return parseInovarHTML(scheduleRes.data);

  } catch (error) {
    console.error('[Inovar Scraper Error Detalhado]', error);
    const detail = error.response ? `(HTTP ${error.response.status})` : error.message;
    throw new Error(`Falha na comunicação: ${detail}`);
  }
}

function parseInovarHTML(html) {
  const $ = cheerio.load(html);
  const schedule = { 1: [], 2: [], 3: [], 4: [], 5: [] };

  // Localizar a tabela de horário (geralmente a maior tabela com id ou classe específica)
  // O formato WebForms tem normalmente <tr> com <th> para dias e <td> para aulas
  let table = $('table').filter((i, el) => $(el).text().toLowerCase().includes('segunda'));
  
  if (table.length === 0) table = $('table').first();

  if (table.length === 0) {
    throw new Error('Não foi possível encontrar a tabela de horário na página.');
  }

  // Iterar pelas linhas (saltando o cabeçalho)
  table.find('tr').each((rowIdx, rowEl) => {
    const cells = $(rowEl).find('td');
    
    // Assumir que a 1ª coluna é a hora e as 5 seguintes são os dias (Seg a Sex)
    // Este parsing é simplificado, pois as tabelas Inovar têm spans complexos.
    if (cells.length >= 6) {
      const timeText = $(cells[0]).text().trim(); // ex: "08:30 - 09:20"
      
      for (let day = 1; day <= 5; day++) {
        const cellText = $(cells[day]).text().trim();
        if (cellText && cellText.length > 2) {
          schedule[day].push({
            id: `inovar-${day}-${rowIdx}-${Math.random().toString(36).substr(2, 5)}`,
            subject: cellText.split('\n')[0].trim(), // Pega apenas a 1ª linha (disciplina)
            time: timeText,
            room: cellText.includes('Sala') ? cellText.split('Sala')[1].trim() : '',
            teacher: '',
            email: ''
          });
        }
      }
    }
  });

  return schedule;
}
