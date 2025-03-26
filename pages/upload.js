import { useEffect, useState } from "react";
import { useRouter } from "next/router"; 
import JSZip from "jszip";

export default function UploadPage() {
  const [file, setFile] = useState(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [fileData, setFileData] = useState(null);
  const [fileList, setFileList] = useState([]); 
  const [selectedFileId, setSelectedFileId] = useState(null); 
  const router = useRouter();
  const [extraText, setExtraText] = useState("");
  const [Chat, setChat] = useState("");
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/"); 
    } else {
      const nameID = localStorage.getItem("id");
      fetchFiles(nameID); 
    }
  }, []);
 
  const fetchFiles = async (id) => {
    try {
      const res = await fetch(`http://localhost:5000/documents/user/${id}`);
      if (!res.ok) {
        throw new Error("Erro ao buscar arquivos");
      }
  
      const files = await res.json();
      if (!Array.isArray(files) || files.length === 0) {
        setFileList([]); 
      } else {
        setFileList(files);
      }
    } catch (error) {
      console.error("Erro ao buscar arquivos:", error);
      setFileList([]); 
    }
  };

  const handleFileSelect = async (e) => {
    const selectedId = e.target.value; 
    setSelectedFileId(selectedId); 
    await fetchImage(selectedId);
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleGoToLogin = () => {
    localStorage.removeItem("token");
    router.push('/');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file) {
      alert("Por favor, selecione um arquivo.");
      return;
    }

    const formData = new FormData();
    const nameID = localStorage.getItem("id");
    formData.append("file", file);
    formData.append("userId", nameID);

    try {
      const res = await fetch("http://localhost:5000/documents/upload", { 
        method: "POST",
        body: formData,
      });
      if (res.ok) {
        alert("Arquivo e dados enviados com sucesso!");
        const nameID = localStorage.getItem("id");
        fetchFiles(nameID); 
      } else {
        alert("Erro ao enviar o arquivo ou dados.");
      }
    } catch (error) {
      alert("Erro ao conectar com o backend.");
      console.error(error);
    }
  };

  const handleSubmit2 = async (e) => {
    e.preventDefault();

    const response = await fetch("http://localhost:5000/users/register", { 
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (data.message !== "Internal server error") { 
      setError("Usuário criado com sucesso!"); 
    } else {
      setError("Erro ao criar usuário, tente novamente!"); 
    }
  };

  const fetchImage = async (id) => {
    try {
      const res = await fetch(`http://localhost:5000/documents/download/${id}`);
      const data = await res.json();
      if (res.ok) {
        setFileData(data); 
      } else {
        console.error("Erro ao carregar a imagem:", res.statusText);
      }
    } catch (error) {
      console.error("Erro ao carregar a imagem:", error);
    }
  };


  const handleUpdateText = async () => {
    if (!selectedFileId) {
      alert("Selecione um arquivo primeiro!");
      return;
    }
    try {

      const res = await fetch(`http://localhost:5000/documents/${selectedFileId}/explain-text`, {
      
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKey:extraText }),
      });
      const data = await res.json();
      if (res.ok) {
        alert("Texto atualizado com sucesso!");

        fetchImage(selectedFileId); // Atualiza os dados do arquivo selecionado
        setChat(data.explanation);
      } else {
        alert("Erro ao atualizar o texto.")
      }
    } catch (error) {
      console.error("Erro ao atualizar o texto:", error);
    }
  };

  const handleDownloadZip = async () => {
    if (!fileData) {
      alert("Nenhum arquivo selecionado.");
      return;
    }

    const zip = new JSZip();
    const imageBlob = await fetch(`data:image/jpg;base64,${fileData.fileData}`).then((res) =>
      res.blob()
    );
    zip.file(fileData.fileName, imageBlob);
    const extractedText = fileData.fileText || "Nenhum texto extraído disponível.";
    zip.file("texto_extraido.txt", extractedText);
    const chatText = Chat || "Nenhuma explicação do ChatGPT disponível.";
    zip.file("explicacao_chatgpt.txt", chatText);
    zip.generateAsync({ type: "blob" }).then((content) => {
      const url = URL.createObjectURL(content);
      const a = document.createElement("a");
      a.href = url;
      a.download = "arquivo_com_textos.zip";
      document.body.appendChild(a);
      a.click();
      a.remove();
    });
  };

  return (
    <div>
        <div>   
            <button onClick={handleGoToLogin}>Retornar ao Login</button>
        </div>

      <h1>Upload de Arquivo</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="file">Escolha um arquivo: </label>
          <br /> 
          <br />
          <input
            type="file"
            id="file"
            onChange={handleFileChange}
            required
          />
        </div>
        <br />
        <button type="submit">Enviar</button>
      </form>

      <h1>Selecione um arquivo</h1>
      <div>
        <label htmlFor="fileSelect">Escolha um arquivo do dropdown:</label>
          <select id="fileSelect" onChange={handleFileSelect} disabled={fileList.length === 0}>
            <option value="">Selecione um arquivo</option>
              {fileList.map((file) => (
            <option key={file.id} value={file.id}>
              {file.filename}
            </option>
            ))}
        </select>
      </div>

      {fileData ? (
        <div>
          <h2>{fileData.fileName}</h2>
          {/* Renderiza a imagem diretamente usando o estado */}
          {fileData.fileData && (
            <img
              src={`data:image/jpg;base64,${fileData.fileData}`}
              alt="Imagem do arquivo"
            />
          )}
          <br />
          <h2>{fileData.fileText}</h2>
        </div>
      ) : (
        <p>Não há arquivos para exibir.</p>
      )}

      <div>
        <input
          type="text"
          placeholder="Insira chave do ChatGPT"
          value={extraText}
          onChange={(e) => setExtraText(e.target.value)}
        />
        <button onClick={handleUpdateText}>Enviar</button>
        {Chat && <p style={{ color: "black" }}>{Chat}</p>}
        <br />
        <br />
        <button onClick={handleDownloadZip}>Baixar Arquivo + Textos</button>
      </div>
      
      <h1>Criação de Usuário</h1>
      <form onSubmit={handleSubmit2}>
        <div>
          <label htmlFor="email">Usuário:</label>
          <input
            type="text"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div>
          <label htmlFor="password">Senha: </label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        {error && <p style={{ color: "red" }}>{error}</p>} {/* Exibe o erro, se houver */}
        <br />
        <button type="submit">Enviar</button>
      </form>
    </div>
  );
}
