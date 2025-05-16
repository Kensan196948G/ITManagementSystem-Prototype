import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Box, Button, TextField, Typography,
} from '@mui/material';
import axios from 'axios';

function ResetPassword() {
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isTokenValid, setIsTokenValid] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const tokenParam = searchParams.get('token');
    if (tokenParam) {
      setToken(tokenParam);
    }
  }, [searchParams]);

  const verifyToken = async () => {
    if (!email || !token) return;

    setIsLoading(true);
    try {
      const response = await axios.post('/api/auth/password/verify-token', {
        token,
        email,
      });
      setIsTokenValid(response.data.status === 'success');
      setMessage(response.data.status === 'success' ? '' : '無効なトークンです');
    } catch (error) {
      setMessage(error.response?.data?.message || 'トークンの検証に失敗しました');
      setIsTokenValid(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setMessage('パスワードが一致しません');
      return;
    }

    setIsLoading(true);
    try {
      await axios.post('/api/auth/password/reset', {
        token,
        email,
        new_password: newPassword,
      });
      setMessage('パスワードが正常に更新されました');
      setTimeout(() => navigate('/login'), 2000);
    } catch (error) {
      setMessage(error.response?.data?.message || 'パスワードの更新に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 400, mx: 'auto', mt: 8 }}>
      <Typography variant="h5" gutterBottom>
        パスワード再設定
      </Typography>

      <TextField
        label="メールアドレス"
        type="email"
        fullWidth
        margin="normal"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        onBlur={verifyToken}
        required
      />

      {isTokenValid ? (
        <form onSubmit={handleSubmit}>
          <TextField
            label="新しいパスワード"
            type="password"
            fullWidth
            margin="normal"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
          <TextField
            label="パスワード（確認）"
            type="password"
            fullWidth
            margin="normal"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={isLoading}
            sx={{ mt: 2 }}
          >
            {isLoading ? '更新中...' : 'パスワードを更新'}
          </Button>
        </form>
      ) : (
        <Button
          onClick={verifyToken}
          variant="contained"
          fullWidth
          disabled={isLoading}
          sx={{ mt: 2 }}
        >
          {isLoading ? '検証中...' : 'トークンを検証'}
        </Button>
      )}

      {message && (
        <Typography color={message.includes('正常') ? 'success' : 'error'} sx={{ mt: 2 }}>
          {message}
        </Typography>
      )}
    </Box>
  );
}

export default ResetPassword;
