import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { TailSpin } from 'react-loader-spinner';
import { useNavigate } from 'react-router-dom'; // Router uchun
import { FaTrash } from 'react-icons/fa'; // Ikonlar uchun

const Dashboard = () => {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [subjectDetails, setSubjectDetails] = useState(null);
  const [savollar, setsavollar] = useState({})
  const navigate = useNavigate();
  const fanId = localStorage.getItem('fanId');
console.log(fanId)

const url = axios.create({
  baseURL: 'https://sinfbackend2.onrender.com',
  withCredentials: true,
});

  // Token tekshiruvi va yo'naltirish
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/'); // Token bo'lmasa login sahifasiga yo'naltirish
    }
  }, [navigate]);
  
  // Fanlar ro'yxatini olish
  const fetchSubjects = async () => {
    setLoading(true);
    setError('');
    
    try {
      const token = localStorage.getItem('token');

      if (!token) {
        navigate('/');
        setError('Token topilmadi. Iltimos, qayta login qiling.');
        return;
      }

      const response = await url.post(`/api/subjects`, { fanId }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setSubjects(response.data.subjects);
    } catch (err) {
      setError('Ma\'lumotlarni olishda xatolik yuz berdi.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUsers = async (id) => {
    setLoading(true); // Yuklanishni boshqarish uchun

    try {
      const token = localStorage.getItem('token'); // Tokenni olish

      if (!token) {
        throw new Error('Token topilmadi. Iltimos, qayta login qiling.');
      }

      // DELETE metodidan foydalanib, foydalanuvchini o'chirish
      await url.delete(`/admin/users/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`, // Tokenni so'rovga qo'shish
        },
      });

      // O'chirilgandan keyin qaysidir ma'lumotni yangilash yoki ma'lumotlarni qayta yuklash
      console.log('Foydalanuvchi muvaffaqiyatli o\'chirildi');
      // Bu yerda boshqa amallarni bajarishingiz mumkin (ma'lumotlarni qayta yuklash kabi)

    } catch (err) {
      console.error('Xatolik yuz berdi:', err.message); // Xatolikni konsolga chiqarish
    } finally {
      setLoading(false); // Yuklanishni to'xtatish
    }
  };


  const handleDelete = async (id) => {
    setLoading(true); // Yuklanishni boshqarish uchun

    try {
      const token = localStorage.getItem('token');
      // Tokenni olish

      if (!token) {
        throw new Error('Token topilmadi. Iltimos, qayta login qiling.');
      }

      // DELETE metodi orqali savol yoki foydalanuvchini o'chirish
      await url.delete(`/admin/subject/${fanId}`, {
        headers: {
          Authorization: `Bearer ${token}`, // Tokenni yuborish
        },
      });

      // Ma'lumotlarni yangilash (foydalanuvchilar va savollarni qayta yuklash)
      // Bu yerda callback yoki yangilash amallarini bajaring
      console.log('O\'chirish muvaffaqiyatli yakunlandi.');
      // Masalan, setUsers(yangiFoydalanuvchilar) yoki setQuestions(yangiSavollar) funksiyalaridan foydalanishingiz mumkin.

    } catch (err) {
      setError('O\'chirishda xatolik yuz berdi.'); // Xatolikni ko'rsatish
      console.error(err);
    } finally {
      setLoading(false); // Yuklanishni to'xtatish
    }
  };


  // Tanlangan fan bo'yicha savollarni olish
  const handleSubjectClick = async (subject) => {
    setLoading(true);
    setSelectedSubject(subject);
    setError('');
    setSubjectDetails(null);

    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`/admin/subjects/${subject._id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setsavollar(response.data.questionsWithOptions)
      response.data.questionsWithOptions.forEach(question => {
        console.log(question._questionId); // Har bir savolning _questionId sini chiqarish
      });


      setSubjectDetails(response.data);
    } catch (err) {
      setError('Ma\'lumotlarni olishda xatolik yuz berdi.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-indigo-600 to-purple-600 flex flex-col items-center justify-center p-6">
      <div className="bg-white shadow-2xl rounded-xl p-6 md:p-8 w-full max-w-7xl">
        <h1 className="text-4xl font-bold text-center mb-8 text-gray-800">Admin Dashboard</h1>

        <h2 className="text-2xl font-semibold text-gray-700 mb-6">Fanlar ro'yxati</h2>

        <button
          onClick={fetchSubjects}
          className="mb-6 w-full py-3 px-6 bg-indigo-600 text-white font-semibold rounded-lg shadow-lg hover:bg-indigo-700 transition duration-300"
        >
          Fanlarni yuklash
        </button>

        {loading && (
          <div className="flex justify-center items-center">
            <TailSpin height="50" width="50" color="blue" ariaLabel="loading" />
          </div>
        )}

        {error && <div className="text-red-600 text-center mb-6">{error}</div>}

        {/* Fanlar ro'yxati */}
        <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {subjects.length > 0 ? (
            subjects.map((subject) => (
              <li
                key={subject._id}
                onClick={() => handleSubjectClick(subject)}
                className="cursor-pointer p-4 border border-gray-300 bg-gray-100 rounded-lg hover:bg-gray-200 transition duration-200 text-gray-800"
              >
                {subject.name}
              </li>
            ))
          ) : (
            <li className="text-gray-500 italic text-center col-span-full">Fanlar topilmadi.</li>
          )}
        </ul>

        {selectedSubject && subjectDetails && (
          <div className="mt-8 bg-gray-100 p-6 rounded-lg shadow-lg">
            <h3 className="text-2xl font-semibold text-gray-700 mb-6">Savollar va Foydalanuvchilar</h3>

            {/* Savollar jadvali */}
            <h4 className="text-lg font-bold mt-6">Savollar:</h4>
            <table className="table-auto w-full bg-white shadow-lg rounded-lg">
              <thead className="bg-indigo-600 text-white">
                <tr>
                  <th className="px-4 py-2">Savol</th>
                  <th className="px-4 py-2">Variantlar</th>
                  <th className="px-4 py-2">Amallar</th>
                </tr>

              </thead>
              <tbody>
                {savollar
                  && savollar.length > 0 ? (
                  savollar.map((question) => (
                    <tr key={question._id} className="border-b border-gray-300">
                      <td className="px-4 py-2">{question.questionText}</td>
                      <td className="px-4 py-2">
                        <ul>
                          {question.options.map((option) => (
                            <li key={option._id} className={option.isCorrect ? 'text-green-500' : ''}>
                              {option.text}
                            </li>
                          ))}
                        </ul>
                      </td>
                      <td className="px-4 py-2 text-center">
                        <button
                          onClick={() => handleDelete()}
                          className="text-red-600 hover:text-red-800"
                        >
                          <FaTrash />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" className="text-gray-500 italic text-center py-4">Savollar topilmadi.</td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* Foydalanuvchilar jadvali */}
            <h4 className="text-lg font-bold mt-6">Foydalanuvchilar:</h4>
            <table className="table-auto w-full bg-white shadow-lg rounded-lg">
              <thead className="bg-indigo-600 text-white">
                <tr>
                  <th className="px-4 py-2">Foydalanuvchi</th>
                  <th className="px-4 py-2">Natija</th>
                  <th className="px-4 py-2">Amallar</th>
                </tr>
              </thead>
              <tbody>
                {subjectDetails.userResults && subjectDetails.userResults.length > 0 ? (
                  subjectDetails.userResults.map((result) => (
                    <tr key={result.user} className="border-b border-gray-300">
                      <td className="px-4 py-2">{result.userName}</td>
                      <td className="px-4 py-2">{result.correctAnswersCount}/{result.totalQuestions} to'g'ri</td>
                      <td className="px-4 py-2 text-center">
                        <button
                          onClick={() => handleDeleteUsers(result.userId)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <FaTrash />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" className="text-gray-500 italic text-center py-4">Foydalanuvchilar natijalari topilmadi.</td>
                  </tr>
                )}
              </tbody>
            </table>

          </div>
        )}

        {/* Tanlangan fan haqida ma'lumot bo'lmasa */}
        {!selectedSubject && !loading && (
          <div className="mt-8 text-center text-gray-600">
            Iltimos, fanlardan birini tanlang yoki yangi fanlar qo'shish uchun yuqoridagi tugmani bosing.
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard