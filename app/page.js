'use client';

import { useEffect, useMemo, useState } from 'react';

const hoy = () => new Date().toISOString().slice(0, 10);

const fmt = (f) => {
  if (!f) return '--';
  const d = new Date(f);
  return d.toLocaleDateString('es-GT', { day: '2-digit', month: 'short', year: 'numeric' });
};

export default function Page() {
  const [datos, setDatos] = useState({ juegos: [], personas: [], prestamos: [] });
  const [cargando, setCargando] = useState(true);
  const [aviso, setAviso] = useState(null);
  const [tab, setTab] = useState('coleccion');
  const [busqueda, setBusqueda] = useState('');
  const [filtro, setFiltro] = useState('todos');

  const [juego, setJuego] = useState({ titulo: '', plataforma: '', genero: '' });
  const [persona, setPersona] = useState({ nombre: '', contacto: '' });
  const [prestamo, setPrestamo] = useState({ juego_id: '', persona_id: '', fecha_prestamo: hoy() });

  async function cargar() {
    try {
      const res = await fetch('/api/datos', { cache: 'no-store' });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'No se pudo leer la base de datos.');
      setDatos(json);
    } catch (e) {
      setAviso({ tipo: 'error', texto: e.message });
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargar();
  }, []);

  async function enviar(url, body, mensajeOk, metodo = 'POST') {
    setAviso(null);
    try {
      const res = await fetch(url, {
        method: metodo,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Ocurrio un error.');
      setAviso({ tipo: 'ok', texto: mensajeOk });
      await cargar();
      return true;
    } catch (e) {
      setAviso({ tipo: 'error', texto: e.message });
      return false;
    }
  }

  const disponibles = datos.juegos.filter((j) => j.estado === 'Disponible');
  const prestados = datos.juegos.length - disponibles.length;
  const activos = datos.prestamos.filter((p) => p.estado === 'prestado');

  const juegosVisibles = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    return datos.juegos.filter((j) => {
      const coincide =
        !q ||
        j.titulo.toLowerCase().includes(q) ||
        j.plataforma.toLowerCase().includes(q) ||
        j.genero.toLowerCase().includes(q);
      const pasaFiltro =
        filtro === 'todos' ||
        (filtro === 'disponibles' && j.estado === 'Disponible') ||
        (filtro === 'prestados' && j.estado === 'Prestado');
      return coincide && pasaFiltro;
    });
  }, [datos.juegos, busqueda, filtro]);

  const prestamosVisibles = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    return datos.prestamos.filter((p) => {
      const coincide =
        !q || p.titulo.toLowerCase().includes(q) || p.persona.toLowerCase().includes(q);
      const pasaFiltro =
        filtro === 'todos' ||
        (filtro === 'disponibles' && p.estado === 'devuelto') ||
        (filtro === 'prestados' && p.estado === 'prestado');
      return coincide && pasaFiltro;
    });
  }, [datos.prestamos, busqueda, filtro]);

  return (
    <main className="page">
      <header className="masthead">
        <div>
          <h1>Prestamo de Videojuegos</h1>
          <p>Registro de la coleccion, de las personas y control de prestamos y devoluciones.</p>
        </div>
        <div className="metrics">
          <div className="metric">
            <span className="value num">{datos.juegos.length}</span>
            <span className="label">Juegos</span>
          </div>
          <div className="metric">
            <span className="value num">{disponibles.length}</span>
            <span className="label">Disponibles</span>
          </div>
          <div className="metric">
            <span className="value num">{prestados}</span>
            <span className="label">Prestados</span>
          </div>
          <div className="metric">
            <span className="value num">{datos.personas.length}</span>
            <span className="label">Personas</span>
          </div>
        </div>
      </header>

      {aviso && (
        <div className={`notice ${aviso.tipo === 'error' ? 'notice-error' : 'notice-ok'}`}>
          {aviso.texto}
        </div>
      )}

      <div className="layout">
        <div>
          <section className="card">
            <div className="card-head">
              <h2>Registrar juego</h2>
            </div>
            <div className="card-body">
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  const ok = await enviar('/api/juegos', juego, 'Juego registrado.');
                  if (ok) setJuego({ titulo: '', plataforma: '', genero: '' });
                }}
              >
                <div className="field">
                  <label htmlFor="titulo">Titulo</label>
                  <input
                    id="titulo"
                    value={juego.titulo}
                    onChange={(e) => setJuego({ ...juego, titulo: e.target.value })}
                    placeholder="Nombre del videojuego"
                    required
                  />
                </div>
                <div className="row">
                  <div className="field">
                    <label htmlFor="plataforma">Plataforma</label>
                    <input
                      id="plataforma"
                      list="plataformas"
                      value={juego.plataforma}
                      onChange={(e) => setJuego({ ...juego, plataforma: e.target.value })}
                      placeholder="PC, PS5, Switch"
                      required
                    />
                    <datalist id="plataformas">
                      <option value="PC" />
                      <option value="PlayStation 5" />
                      <option value="Xbox Series X" />
                      <option value="Nintendo Switch" />
                    </datalist>
                  </div>
                  <div className="field">
                    <label htmlFor="genero">Genero</label>
                    <input
                      id="genero"
                      list="generos"
                      value={juego.genero}
                      onChange={(e) => setJuego({ ...juego, genero: e.target.value })}
                      placeholder="Accion, RPG"
                      required
                    />
                    <datalist id="generos">
                      <option value="Accion" />
                      <option value="Aventura" />
                      <option value="RPG" />
                      <option value="Deportes" />
                      <option value="Estrategia" />
                      <option value="Carreras" />
                    </datalist>
                  </div>
                </div>
                <button className="btn-primary" type="submit">Agregar juego</button>
              </form>
            </div>
          </section>

          <section className="card">
            <div className="card-head">
              <h2>Registrar persona</h2>
            </div>
            <div className="card-body">
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  const ok = await enviar('/api/personas', persona, 'Persona registrada.');
                  if (ok) setPersona({ nombre: '', contacto: '' });
                }}
              >
                <div className="field">
                  <label htmlFor="nombre">Nombre</label>
                  <input
                    id="nombre"
                    value={persona.nombre}
                    onChange={(e) => setPersona({ ...persona, nombre: e.target.value })}
                    placeholder="Nombre completo"
                    required
                  />
                </div>
                <div className="field">
                  <label htmlFor="contacto">Contacto (opcional)</label>
                  <input
                    id="contacto"
                    value={persona.contacto}
                    onChange={(e) => setPersona({ ...persona, contacto: e.target.value })}
                    placeholder="Correo o telefono"
                  />
                </div>
                <button className="btn-primary" type="submit">Agregar persona</button>
              </form>
            </div>
          </section>

          <section className="card">
            <div className="card-head">
              <h2>Nuevo prestamo</h2>
            </div>
            <div className="card-body">
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  const ok = await enviar('/api/prestamos', prestamo, 'Prestamo registrado.');
                  if (ok) setPrestamo({ juego_id: '', persona_id: '', fecha_prestamo: hoy() });
                }}
              >
                <div className="field">
                  <label htmlFor="juego">Juego disponible</label>
                  <select
                    id="juego"
                    value={prestamo.juego_id}
                    onChange={(e) => setPrestamo({ ...prestamo, juego_id: e.target.value })}
                    required
                  >
                    <option value="">Seleccionar</option>
                    {disponibles.map((j) => (
                      <option key={j.id} value={j.id}>
                        {j.titulo} - {j.plataforma}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="field">
                  <label htmlFor="persona">Persona</label>
                  <select
                    id="persona"
                    value={prestamo.persona_id}
                    onChange={(e) => setPrestamo({ ...prestamo, persona_id: e.target.value })}
                    required
                  >
                    <option value="">Seleccionar</option>
                    {datos.personas.map((p) => (
                      <option key={p.id} value={p.id}>{p.nombre}</option>
                    ))}
                  </select>
                </div>
                <div className="field">
                  <label htmlFor="fecha">Fecha del prestamo</label>
                  <input
                    id="fecha"
                    type="date"
                    value={prestamo.fecha_prestamo}
                    onChange={(e) => setPrestamo({ ...prestamo, fecha_prestamo: e.target.value })}
                    required
                  />
                </div>
                <button
                  className="btn-primary"
                  type="submit"
                  disabled={disponibles.length === 0 || datos.personas.length === 0}
                >
                  Registrar prestamo
                </button>
                {(disponibles.length === 0 || datos.personas.length === 0) && (
                  <p className="muted" style={{ fontSize: 12, marginBottom: 0 }}>
                    Se necesita al menos un juego disponible y una persona registrada.
                  </p>
                )}
              </form>
            </div>
          </section>
        </div>

        <section className="card">
          <div className="tabs" role="tablist">
            <button
              className="tab"
              role="tab"
              aria-selected={tab === 'coleccion'}
              onClick={() => setTab('coleccion')}
            >
              Coleccion
            </button>
            <button
              className="tab"
              role="tab"
              aria-selected={tab === 'prestamos'}
              onClick={() => setTab('prestamos')}
            >
              Prestamos
            </button>
            <button
              className="tab"
              role="tab"
              aria-selected={tab === 'personas'}
              onClick={() => setTab('personas')}
            >
              Personas
            </button>
          </div>

          {tab !== 'personas' && (
            <div className="toolbar">
              <input
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Buscar"
                aria-label="Buscar"
              />
              <select value={filtro} onChange={(e) => setFiltro(e.target.value)} aria-label="Filtrar">
                <option value="todos">Todos</option>
                <option value="disponibles">
                  {tab === 'coleccion' ? 'Solo disponibles' : 'Solo devueltos'}
                </option>
                <option value="prestados">
                  {tab === 'coleccion' ? 'Solo prestados' : 'Solo activos'}
                </option>
              </select>
              <span className="spacer" />
              <span className="count">
                {tab === 'coleccion'
                  ? `${juegosVisibles.length} de ${datos.juegos.length} juegos`
                  : `${activos.length} prestamos activos`}
              </span>
            </div>
          )}

          {cargando ? (
            <p className="empty">Cargando informacion...</p>
          ) : tab === 'coleccion' ? (
            <table>
              <thead>
                <tr>
                  <th>Titulo</th>
                  <th>Plataforma</th>
                  <th>Genero</th>
                  <th>Estado</th>
                  <th>Prestado a</th>
                  <th className="right">Accion</th>
                </tr>
              </thead>
              <tbody>
                {juegosVisibles.length === 0 && (
                  <tr>
                    <td colSpan={6} className="empty">No hay juegos que coincidan.</td>
                  </tr>
                )}
                {juegosVisibles.map((j) => (
                  <tr key={j.id}>
                    <td className="titulo">{j.titulo}</td>
                    <td className="muted">{j.plataforma}</td>
                    <td className="muted">{j.genero}</td>
                    <td>
                      <span className={`badge ${j.estado === 'Disponible' ? 'badge-ok' : 'badge-warn'}`}>
                        {j.estado}
                      </span>
                    </td>
                    <td className="muted nowrap">
                      {j.prestado_a ? `${j.prestado_a} / ${fmt(j.fecha_prestamo)}` : '--'}
                    </td>
                    <td className="right nowrap">
                      {j.estado === 'Prestado' ? (
                        <button
                          className="btn-ghost"
                          onClick={() =>
                            enviar('/api/prestamos/devolver', { id: j.prestamo_id }, 'Devolucion registrada.')
                          }
                        >
                          Devolver
                        </button>
                      ) : (
                        <button
                          className="btn-link"
                          onClick={() => enviar('/api/juegos', { id: j.id }, 'Juego eliminado.', 'DELETE')}
                        >
                          Eliminar
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : tab === 'prestamos' ? (
            <table>
              <thead>
                <tr>
                  <th>Juego</th>
                  <th>Persona</th>
                  <th>Prestamo</th>
                  <th>Devolucion</th>
                  <th>Estado</th>
                  <th className="right">Accion</th>
                </tr>
              </thead>
              <tbody>
                {prestamosVisibles.length === 0 && (
                  <tr>
                    <td colSpan={6} className="empty">Aun no hay prestamos registrados.</td>
                  </tr>
                )}
                {prestamosVisibles.map((p) => (
                  <tr key={p.id}>
                    <td className="titulo">
                      {p.titulo} <span className="muted">/ {p.plataforma}</span>
                    </td>
                    <td>{p.persona}</td>
                    <td className="muted nowrap">{fmt(p.fecha_prestamo)}</td>
                    <td className="muted nowrap">{fmt(p.fecha_devolucion)}</td>
                    <td>
                      <span className={`badge ${p.estado === 'prestado' ? 'badge-warn' : 'badge-ok'}`}>
                        {p.estado === 'prestado' ? 'Activo' : 'Devuelto'}
                      </span>
                    </td>
                    <td className="right nowrap">
                      {p.estado === 'prestado' && (
                        <button
                          className="btn-ghost"
                          onClick={() =>
                            enviar('/api/prestamos/devolver', { id: p.id }, 'Devolucion registrada.')
                          }
                        >
                          Devolver
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Contacto</th>
                  <th>Prestamos activos</th>
                  <th className="right">Accion</th>
                </tr>
              </thead>
              <tbody>
                {datos.personas.length === 0 && (
                  <tr>
                    <td colSpan={4} className="empty">No hay personas registradas.</td>
                  </tr>
                )}
                {datos.personas.map((p) => {
                  const n = activos.filter((a) => a.persona === p.nombre).length;
                  return (
                    <tr key={p.id}>
                      <td className="titulo">{p.nombre}</td>
                      <td className="muted">{p.contacto || '--'}</td>
                      <td className="num">{n}</td>
                      <td className="right">
                        <button
                          className="btn-link"
                          onClick={() => enviar('/api/personas', { id: p.id }, 'Persona eliminada.', 'DELETE')}
                        >
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </section>
      </div>
    </main>
  );
}
