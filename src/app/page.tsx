import Link from 'next/link'
import { Sprout, Satellite, BarChart3, Users, Eye, Globe, Sparkles, ArrowRight } from 'lucide-react'

export default function Home() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-green-500 via-emerald-600 to-teal-700 text-white overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-white/10 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
          <div className="absolute top-40 right-20 w-72 h-72 bg-emerald-300/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-teal-300/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
        </div>
        
        <div className="container px-4 py-32 mx-auto relative z-10">
          <div className="max-w-5xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium mb-8 border border-white/30">
              <Sparkles className="mr-2 h-4 w-4" />
              NASA Space Apps Challenge 2025
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-8 bg-gradient-to-r from-white to-green-100 bg-clip-text text-transparent">
              BloomWatch
            </h1>
            <p className="text-2xl md:text-3xl mb-8 text-green-50 font-light">
              Monitoreo inteligente de la floración del maíz
            </p>
            <p className="text-lg mb-12 text-green-100/90 max-w-3xl mx-auto leading-relaxed">
              Utilizamos datos satelitales de la NASA y tecnología de vanguardia para revolucionar 
              la agricultura y la investigación fenológica del maíz mexicano, proporcionando 
              insights precisos para mejorar los rendimientos.
            </p>

            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <Link
                href="/auth/register?role=agricultor"
                className="group inline-flex items-center px-8 py-4 bg-white text-green-800 rounded-xl font-semibold hover:bg-green-50 transition-all duration-300 transform hover:scale-105 shadow-2xl hover:shadow-green-200/50"
              >
                <Sprout className="mr-3 h-6 w-6" />
                Soy Agricultor
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                href="/auth/register?role=investigador"
                className="group inline-flex items-center px-8 py-4 bg-transparent text-white border-2 border-white/50 rounded-xl font-semibold hover:bg-white/10 hover:border-white transition-all duration-300 transform hover:scale-105 backdrop-blur-sm"
              >
                <BarChart3 className="mr-3 h-6 w-6" />
                Soy Investigador
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        </div>
        
        {/* Wave decoration */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg className="w-full h-20" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M0,60 C400,120 800,0 1200,60 L1200,120 L0,120 Z" fill="currentColor" className="text-white dark:text-gray-950"></path>
          </svg>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-32 bg-gradient-to-b from-white to-gray-50 dark:from-gray-950 dark:to-gray-900">
        <div className="container px-4 mx-auto">
          <div className="text-center mb-20">
            <div className="inline-flex items-center px-4 py-2 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded-full text-sm font-medium mb-6">
              <Sparkles className="mr-2 h-4 w-4" />
              Tecnología de Vanguardia
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
              ¿Por qué BloomWatch?
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Nuestra plataforma combina datos satelitales de la NASA con
              inteligencia artificial para proporcionar información precisa
              sobre los eventos de floración con una precisión sin precedentes.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="group text-center p-8 bg-white dark:bg-gray-800/50 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-gray-100 dark:border-gray-700/50">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-600 rounded-2xl mb-6 group-hover:scale-110 transition-transform duration-300">
                <Satellite className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
                Datos Satelitales NASA
              </h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                Utilizamos imágenes de MODIS, Landsat y VIIRS para detectar
                eventos de floración con precisión temporal y espacial excepcional.
              </p>
              <div className="mt-6 w-full h-1 bg-gradient-to-r from-green-400 to-emerald-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>

            <div className="group text-center p-8 bg-white dark:bg-gray-800/50 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-gray-100 dark:border-gray-700/50">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-400 to-cyan-600 rounded-2xl mb-6 group-hover:scale-110 transition-transform duration-300">
                <Eye className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
                Monitoreo en Tiempo Real
              </h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                Visualiza el estado actual de tus cultivos y recibe alertas
                inteligentes sobre cambios importantes en los patrones de floración.
              </p>
              <div className="mt-6 w-full h-1 bg-gradient-to-r from-blue-400 to-cyan-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>

            <div className="group text-center p-8 bg-white dark:bg-gray-800/50 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-gray-100 dark:border-gray-700/50">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-400 to-pink-600 rounded-2xl mb-6 group-hover:scale-110 transition-transform duration-300">
                <BarChart3 className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
                Análisis Predictivo
              </h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                Modelos de IA avanzados que predicen patrones de floración y optimizan las
                decisiones agrícolas basadas en datos históricos y tendencias.
              </p>
              <div className="mt-6 w-full h-1 bg-gradient-to-r from-purple-400 to-pink-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Target Users Section */}
      <section className="py-32 bg-gradient-to-br from-gray-50 via-white to-green-50/30 dark:from-gray-900 dark:via-gray-800 dark:to-green-900/20 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-10 right-10 w-96 h-96 bg-green-200 dark:bg-green-800/30 rounded-full mix-blend-multiply filter blur-3xl"></div>
          <div className="absolute bottom-10 left-10 w-96 h-96 bg-blue-200 dark:bg-blue-800/30 rounded-full mix-blend-multiply filter blur-3xl"></div>
        </div>
        
        <div className="container px-4 mx-auto relative z-10">
          <div className="text-center mb-20">
            <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-green-100 to-blue-100 dark:from-green-900/30 dark:to-blue-900/30 text-gray-800 dark:text-gray-200 rounded-full text-sm font-medium mb-6">
              <Users className="mr-2 h-4 w-4" />
              Para Todos los Profesionales
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
              Diseñado para Ti
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Dos experiencias especializadas, una plataforma potente
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
            {/* Farmers Card */}
            <div className="group relative bg-gradient-to-br from-green-400/10 to-emerald-600/10 dark:from-green-800/20 dark:to-emerald-900/20 p-8 rounded-3xl border border-green-200/50 dark:border-green-700/30 hover:border-green-300 dark:hover:border-green-600 transition-all duration-500 hover:shadow-2xl hover:shadow-green-200/20 dark:hover:shadow-green-900/20">
              <div className="absolute top-6 right-6 w-24 h-24 bg-green-400/20 rounded-full blur-2xl"></div>
              
              <div className="relative z-10">
                <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-green-400 to-emerald-600 rounded-3xl mb-8 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <Sprout className="h-12 w-12 text-white" />
                </div>
                
                <h3 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">
                  Para Agricultores
                </h3>
                
                <ul className="space-y-4 mb-8">
                  <li className="flex items-center text-gray-700 dark:text-gray-300">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                    Monitoreo en tiempo real de cultivos
                  </li>
                  <li className="flex items-center text-gray-700 dark:text-gray-300">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                    Optimización de riego y nutrientes
                  </li>
                  <li className="flex items-center text-gray-700 dark:text-gray-300">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                    Predicciones de rendimiento
                  </li>
                  <li className="flex items-center text-gray-700 dark:text-gray-300">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                    Alertas personalizadas
                  </li>
                </ul>
                
                <Link
                  href="/auth/register?role=agricultor"
                  className="group/btn inline-flex items-center px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-semibold hover:from-green-600 hover:to-emerald-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                >
                  Comenzar como Agricultor
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover/btn:translate-x-1" />
                </Link>
              </div>
            </div>

            {/* Researchers Card */}
            <div className="group relative bg-gradient-to-br from-blue-400/10 to-cyan-600/10 dark:from-blue-800/20 dark:to-cyan-900/20 p-8 rounded-3xl border border-blue-200/50 dark:border-blue-700/30 hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-500 hover:shadow-2xl hover:shadow-blue-200/20 dark:hover:shadow-blue-900/20">
              <div className="absolute top-6 right-6 w-24 h-24 bg-blue-400/20 rounded-full blur-2xl"></div>
              
              <div className="relative z-10">
                <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-blue-400 to-cyan-600 rounded-3xl mb-8 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <Users className="h-12 w-12 text-white" />
                </div>
                
                <h3 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">
                  Para Investigadores
                </h3>
                
                <ul className="space-y-4 mb-8">
                  <li className="flex items-center text-gray-700 dark:text-gray-300">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                    Acceso a datos históricos completos
                  </li>
                  <li className="flex items-center text-gray-700 dark:text-gray-300">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                    Herramientas de análisis avanzado
                  </li>
                  <li className="flex items-center text-gray-700 dark:text-gray-300">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                    Estudios fenológicos detallados
                  </li>
                  <li className="flex items-center text-gray-700 dark:text-gray-300">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                    Exportación de datasets
                  </li>
                </ul>
                
                <Link
                  href="/auth/register?role=investigador"
                  className="group/btn inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-cyan-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                >
                  Comenzar como Investigador
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover/btn:translate-x-1" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-32 bg-gradient-to-br from-green-600 via-emerald-700 to-teal-800 text-white overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-96 h-96 bg-white/10 rounded-full mix-blend-multiply filter blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-emerald-400/20 rounded-full mix-blend-multiply filter blur-3xl animate-pulse animation-delay-2000"></div>
        </div>
        
        {/* Grid pattern overlay */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.3) 1px, transparent 0)`,
            backgroundSize: '50px 50px'
          }}></div>
        </div>
        
        <div className="container px-4 mx-auto text-center relative z-10">
          <div className="max-w-4xl mx-auto">
            {/* Icon with glow effect */}
            <div className="inline-flex items-center justify-center w-24 h-24 bg-white/20 rounded-3xl mb-8 backdrop-blur-sm border border-white/30">
              <Globe className="h-12 w-12 text-white animate-pulse" />
            </div>
            
            <h2 className="text-4xl md:text-6xl font-bold mb-8 bg-gradient-to-r from-white to-green-100 bg-clip-text text-transparent">
              Únete a la Revolución Agrícola
            </h2>
            
            <p className="text-xl md:text-2xl text-green-100/90 mb-12 max-w-3xl mx-auto leading-relaxed">
              Forma parte del futuro de la agricultura mexicana con datos
              satelitales de última generación, análisis inteligente y una comunidad
              comprometida con la innovación.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <Link
                href="/auth/register"
                className="group inline-flex items-center px-10 py-5 bg-white text-green-800 rounded-2xl font-bold hover:bg-green-50 transition-all duration-300 transform hover:scale-105 text-lg shadow-2xl hover:shadow-white/20"
              >
                <Sparkles className="mr-3 h-6 w-6" />
                Crear Cuenta Gratis
                <ArrowRight className="ml-3 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>
              
              <Link
                href="/auth/login"
                className="group inline-flex items-center px-8 py-4 bg-transparent text-white border-2 border-white/50 rounded-2xl font-semibold hover:bg-white/10 hover:border-white transition-all duration-300 backdrop-blur-sm"
              >
                Ya tengo cuenta
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
            
            {/* Stats or badges */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-8 mt-16 pt-16 border-t border-white/20">
              <div className="text-center">
                <div className="text-3xl font-bold text-white mb-2">NASA</div>
                <div className="text-green-100 text-sm">Datos Satelitales</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white mb-2">24/7</div>
                <div className="text-green-100 text-sm">Monitoreo Continuo</div>
              </div>
              <div className="text-center md:col-span-1 col-span-2">
                <div className="text-3xl font-bold text-white mb-2">AI</div>
                <div className="text-green-100 text-sm">Análisis Inteligente</div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
