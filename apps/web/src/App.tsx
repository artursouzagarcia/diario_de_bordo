import { useEffect, useMemo, useState } from 'react';
import {
  AppBar,
  Box,
  CssBaseline,
  Divider,
  IconButton,
  InputAdornment,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  TextField,
  Toolbar,
  Typography,
  Paper,
  Button,
} from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import SendIcon from '@mui/icons-material/Send';
import MicIcon from '@mui/icons-material/Mic';
import type { Conversation, Message, FileMeta } from '@diario/types';
import { api } from './lib/api';

const drawerWidth = 320;
const modeLocalStorageKey = 'diario_de_bordo_mode';

export default function App() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [filesById, setFilesById] = useState<Record<string, FileMeta>>({});
  const [text, setText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [mode, setMode] = useState<'light' | 'dark'>(() : 'light' | 'dark'  => {
    const savedMode = localStorage.getItem(modeLocalStorageKey) as 'light' | 'dark' | null;
    return savedMode || 'light';
  } );
  const theme = useMemo(() => createTheme({ palette: { mode } }), [mode]);

  useEffect(() => {
    api.getConversations().then((items) => {
      setConversations(items);
      if (items.length && !activeId) setActiveId(items[0].id);
    });
  }, []);

  useEffect(() => {
    if (!activeId) return;
    api.getMessages(activeId).then(setMessages);
    api.listFiles(activeId).then((items) => {
      setFilesById(Object.fromEntries(items.map((f) => [f.id, f])));
    });
  }, [activeId]);

  useEffect(() => {
    localStorage.setItem(modeLocalStorageKey, mode);
  }, [mode]);

  const activeConv = useMemo(() => conversations.find((c) => c.id === activeId) || null, [conversations, activeId]);

  async function handleSend() {
    if (!activeId || !text.trim()) return;
    const msg = await api.sendMessage({ conversationId: activeId, role: 'user', content: text, type: 'text' });
    setMessages((m) => [...m, msg]);
    setText('');
  }

  async function handleNewConversation() {
    const conv = await api.createConversation({});
    setConversations((c) => [conv, ...c]);
    setActiveId(conv.id);
    setMessages([]);
  }

  async function handleAttach(e: React.ChangeEvent<HTMLInputElement>) {
    if (!activeId) return;
    const file = e.target.files?.[0];
    if (!file) return;
  const res = await api.uploadFile(activeId, file);
  const payload = (await res.json()) as { file: FileMeta; message: Message };
  setFilesById((m) => ({ ...m, [payload.file.id]: payload.file }));
  setMessages((m) => [...m, payload.message]);
  }

  function toggleRecord() {
    // Placeholder: integrar WebAudio/MediaRecorder conforme necessidade
    setIsRecording((v) => !v);
  }

  return (
    <ThemeProvider theme={theme}>
    <Box sx={{ display: 'flex', height: '100vh', bgcolor: 'background.default', color: 'text.primary' }}>
      <CssBaseline />
      <AppBar position="fixed" sx={{ zIndex: (t) => t.zIndex.drawer + 1 }}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>Diário de Bordo</Typography>
          <IconButton color="inherit" onClick={() => setMode(mode === 'light' ? 'dark' : 'light')} title="Alternar tema">
            {mode === 'light' ? <DarkModeIcon /> : <LightModeIcon />}
          </IconButton>
          <Button color="inherit" onClick={handleNewConversation}>Nova conversa</Button>
        </Toolbar>
      </AppBar>

      <Box component="nav" sx={{ width: drawerWidth, flexShrink: 0 }}>
        <Box sx={{ width: drawerWidth, pt: 8, height: '100%', borderRight: 1, borderColor: 'divider' }}>
          <List>
            {conversations.map((c) => (
              <ListItem key={c.id} disablePadding>
                <ListItemButton selected={c.id === activeId} onClick={() => setActiveId(c.id)}>
                  <ListItemText
                    primary={
                      c.id === activeId ? (
                        <TextField
                          variant="standard"
                          value={c.title}
                          onChange={(e) => {
                            const title = e.target.value;
                            setConversations((prev) => prev.map((x) => (x.id === c.id ? { ...x, title } : x)));
                          }}
                          onBlur={async (e) => {
                            const title = e.target.value.trim();
                            const updated = await api.updateConversation(c.id, { title });
                            setConversations((prev) => prev.map((x) => (x.id === c.id ? updated : x)));
                          }}
                          onKeyDown={async (e) => {
                            if (e.key === 'Enter') {
                              (e.target as HTMLInputElement).blur();
                            }
                          }}
                          placeholder="Sem título"
                          fullWidth
                        />
                      ) : (
                        c.title || 'Sem título'
                      )
                    }
                    secondary={new Date(c.updatedAt).toLocaleString()}
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Box>
      </Box>

      <Box component="main" sx={{ flexGrow: 1, p: 0 }}>
        <Toolbar />
        <Box sx={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 64px)' }}>
          <Box sx={{ flex: 1, overflowY: 'auto', p: 2 }}>
            {!activeConv && (
              <Typography sx={{ color: 'text.secondary', mt: 2 }}>Selecione ou crie uma conversa.</Typography>
            )}
            {messages.map((m) => (
              <Paper key={m.id} variant="outlined" sx={{ p: 1.5, mb: 1, maxWidth: 720, ml: m.role === 'assistant' ? 0 : 'auto' }}>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  {m.role} • {new Date(m.createdAt).toLocaleTimeString()}
                </Typography>
                <Typography>{m.content}</Typography>
                {!!m.fileIds?.length && (
                  <Box sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {m.fileIds.map((fid) => {
                      const f = filesById[fid];
                      if (!f) return null;
                      const canInline = /^image\//.test(f.mimeType) || /^audio\//.test(f.mimeType) || f.mimeType === 'application/pdf' || /^video\//.test(f.mimeType);
                      return (
                        <Box key={fid} sx={{ border: '1px dashed', borderColor: 'divider', p: 1, borderRadius: 1 }}>
                          {/* <Typography variant="body2" sx={{ mb: 0.5 }}>{f.name} ({Math.round(f.size/1024)} KB)</Typography> */}
                          {canInline ? (
                            f.mimeType.startsWith('image/') ? (
                              <img src={f.url} alt={f.name} style={{ maxWidth: '100%', borderRadius: 4 }} />
                            ) : f.mimeType.startsWith('audio/') ? (
                              <audio controls src={f.url} />
                            ) : f.mimeType.startsWith('video/') ? (
                              <video controls src={f.url} style={{ maxWidth: '100%' }} />
                            ) : (
                              <iframe src={f.url} style={{ width: '100%', height: 360, border: 0 }} title={f.name} />
                            )
                          ) : (
                            <Button variant="outlined" size="small" href={api.getFileUrl(fid, true)}>
                              Baixar
                            </Button>
                          )}
                        </Box>
                      );
                    })}
                  </Box>
                )}
              </Paper>
            ))}
          </Box>
          <Divider />
          <Box sx={{ p: 1.5 }}>
            <TextField
              fullWidth
              placeholder={activeConv ? 'Escreva sua mensagem...' : 'Crie uma conversa para começar'}
              disabled={!activeConv}
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  (e.target as HTMLInputElement).blur();
                }
              }}
              multiline
              maxRows={6}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton component="label" size="small" title="Anexar arquivo">
                      <AttachFileIcon />
                      <input type="file" hidden onChange={handleAttach} />
                    </IconButton>
                    <IconButton size="small" title={isRecording ? 'Parar' : 'Gravar áudio'} onClick={toggleRecord} color={isRecording ? 'error' : 'default'}>
                      <MicIcon />
                    </IconButton>
                    <IconButton color="primary" size="small" title="Enviar" onClick={handleSend}>
                      <SendIcon />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Box>
        </Box>
      </Box>
  </Box>
  </ThemeProvider>
  );
}
