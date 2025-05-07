import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, TextField, Typography } from '@mui/material';
import axios from 'axios';

const ResetPasswordRequest = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await axios.post('/api/auth/password/reset-request', { email });
      setMessage('パスワードリセット用のメールを送信しました');
    } catch (error) {
      setMessage(error.response?.data?.message || 'エラーが発生しました');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 400, mx: 'auto', mt: 8 }}>
      <Typography variant="h5" gutterBottom>
        パスワードリセット
      </Typography>
      <Typography variant="body1" gutterBottom>
        登録済みのメールアドレスを入力してください
      </Typography>
      <form onSubmit={handleSubmit}>
        <TextField
          label="メールアドレス"
          type="email"
          fullWidth
          margin="normal"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Button
          type="submit"
          variant="contained"
          fullWidth
          disabled={isLoading}
          sx={{ mt: 2 }}
        >
          {isLoading ? '送信中...' : '送信'}
        </Button>
      </form>
      {message && (
        <Typography color={message.includes('送信') ? 'success' : 'error'} sx={{ mt: 2 }}>
          {message}
        </Typography>
      )}
      <Button onClick={() => navigate('/login')} sx={{ mt: 2 }}>
        ログイン画面に戻る
      </Button>
    </Box>
  );
};

export default ResetPasswordRequest;