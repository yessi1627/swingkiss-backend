function serializarUsuario(usuario) {
  const { passwordHash, resetCodigoHash, resetCodigoExpira, interesesJson, fotos, ...resto } =
    usuario;
  return {
    ...resto,
    intereses: interesesJson ? JSON.parse(interesesJson) : [],
    ...(fotos ? { fotos: [...fotos].sort((a, b) => a.orden - b.orden).map((f) => f.url) } : {}),
  };
}

module.exports = { serializarUsuario };
