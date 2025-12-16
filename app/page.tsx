export default function Page() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full bg-white rounded-2xl shadow-2xl p-8 md:p-12">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Elite 2.0</h1>
          <p className="text-xl text-gray-600">Plateforme de formation en ligne</p>
        </div>

        <div className="space-y-6">
          <div className="bg-indigo-50 rounded-lg p-6">
            <h2 className="text-2xl font-semibold text-indigo-900 mb-3">📱 Application Mobile React Native</h2>
            <p className="text-gray-700 mb-4">
              L'application mobile complète est disponible dans le dossier{" "}
              <code className="bg-indigo-100 px-2 py-1 rounded">mobile-app/</code>
            </p>
            <div className="bg-white rounded p-4 font-mono text-sm">
              <p className="text-gray-800">cd mobile-app</p>
              <p className="text-gray-800">npm install</p>
              <p className="text-gray-800">npm start</p>
            </div>
          </div>

          <div className="bg-purple-50 rounded-lg p-6">
            <h2 className="text-2xl font-semibold text-purple-900 mb-3">🔧 Backend Django</h2>
            <p className="text-gray-700 mb-4">Le backend Django REST Framework est disponible à la racine du projet.</p>
            <div className="bg-white rounded p-4 font-mono text-sm">
              <p className="text-gray-800">pip install -r requirements.txt</p>
              <p className="text-gray-800">python manage.py migrate</p>
              <p className="text-gray-800">python manage.py runserver</p>
            </div>
          </div>

          <div className="bg-pink-50 rounded-lg p-6">
            <h2 className="text-2xl font-semibold text-pink-900 mb-3">✨ Fonctionnalités</h2>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 text-gray-700">
              <li className="flex items-start">
                <span className="text-pink-500 mr-2">•</span>
                <span>Système d'authentification complet</span>
              </li>
              <li className="flex items-start">
                <span className="text-pink-500 mr-2">•</span>
                <span>Matching de profils professionnels</span>
              </li>
              <li className="flex items-start">
                <span className="text-pink-500 mr-2">•</span>
                <span>Parcours adaptatifs personnalisés</span>
              </li>
              <li className="flex items-start">
                <span className="text-pink-500 mr-2">•</span>
                <span>Packs de cours avec vidéos</span>
              </li>
              <li className="flex items-start">
                <span className="text-pink-500 mr-2">•</span>
                <span>Quiz et système de progression</span>
              </li>
              <li className="flex items-start">
                <span className="text-pink-500 mr-2">•</span>
                <span>Système de parrainage et récompenses</span>
              </li>
              <li className="flex items-start">
                <span className="text-pink-500 mr-2">•</span>
                <span>Chat entre utilisateurs</span>
              </li>
              <li className="flex items-start">
                <span className="text-pink-500 mr-2">•</span>
                <span>Offres d'emploi et concours</span>
              </li>
            </ul>
          </div>

          <div className="bg-gray-50 rounded-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">📖 Documentation</h2>
            <p className="text-gray-700">
              Consultez le <code className="bg-gray-200 px-2 py-1 rounded">mobile-app/README.md</code> pour la
              documentation complète de l'application mobile et des instructions détaillées d'installation.
            </p>
          </div>
        </div>

        <div className="mt-8 text-center text-gray-500 text-sm">
          <p>Elite 2.0 - Plateforme de formation en ligne professionnelle</p>
        </div>
      </div>
    </div>
  )
}
