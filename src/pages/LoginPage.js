import React, { useState } from "react";
import { login, register } from "../api/auth"; // 아까 만든 함수들 불러오기
import useAuth from "../hooks/useAuth";

export default function LoginPage() {
  const [isRegister, setIsRegister] = useState(false); // 로그인/회원가입 모드 전환
  const [formData, setFormData] = useState({ username: "", password: "", name: "" });
  const { loginUser } = useAuth();

  const handleAction = async () => {
    try {
      if (isRegister) {
        await register(formData.username, formData.password, formData.name);
        alert("회원가입 성공! 이제 로그인하세요.");
        setIsRegister(false);
      } else {
        const data = await login(formData.username, formData.password);
        loginUser(data); // 로컬스토리지에 저장
        window.location.href = "/"; // 메인으로 이동
      }
    } catch (e) {
      alert(e.response?.data?.error || "오류가 발생했습니다.");
    }
  };

  return (
    <div className="card" style={{ width: '300px', margin: '100px auto', padding: '30px' }}>
      <h2 className="title">{isRegister ? "회원가입" : "로그인"}</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {isRegister && (
          <input className="input" placeholder="이름" 
            onChange={e => setFormData({...formData, name: e.target.value})} />
        )}
        <input className="input" placeholder="아이디" 
          onChange={e => setFormData({...formData, username: e.target.value})} />
        <input className="input" type="password" placeholder="비밀번호" 
          onChange={e => setFormData({...formData, password: e.target.value})} />
        
        <button className="btn btn-primary" onClick={handleAction}>
          {isRegister ? "가입하기" : "로그인"}
        </button>
        
        <p style={{ fontSize: '12px', cursor: 'pointer', textAlign: 'center' }} 
           onClick={() => setIsRegister(!isRegister)}>
          {isRegister ? "이미 계정이 있나요? 로그인" : "계정이 없으신가요? 회원가입"}
        </p>
      </div>
    </div>
  );
}